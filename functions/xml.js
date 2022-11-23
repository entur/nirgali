const { addHours, parseISO, addMinutes } = require('date-fns');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const convert = require('xml-js');
const {
  transformSituationData,
  filterOpenExpiredMessages,
  transformCancellationData,
} = require('./utils');

exports.xml = function () {
  return functions
    .region('europe-west1')
    .https.onRequest(async (request, response) => {
      if (request.method !== 'POST') {
        const xmlString =
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>This endpoint only handles POST requests</Body></Message></Response>';
        response
          .set('Content-Type', 'text/xml; charset=utf8')
          .status(200)
          .send(xmlString);
      }

      let serviceRequestType;

      try {
        const requestBody = convert.xml2js(request.body, { compact: true });

        if (requestBody.Siri.ServiceRequest.SituationExchangeRequest) {
          serviceRequestType = 'SituationExchangeRequest';
        } else if (requestBody.Siri.ServiceRequest.EstimatedTimetableRequest) {
          serviceRequestType = 'EstimatedTimetableRequest';
        } else {
          const xmlString =
            '<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>Invalid ServiceRequest</Body></Message></Response>';
          response
            .set('Content-Type', 'text/xml; charset=utf8')
            .status(200)
            .send(xmlString);
        }
      } catch (_) {
        const xmlString =
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>Invalid XML</Body></Message></Response>';
        response
          .set('Content-Type', 'text/xml; charset=utf8')
          .status(200)
          .send(xmlString);
      }

      if (!serviceRequestType) {
        return;
      }

      const dateTime = new Date().toISOString();

      console.info(
        'XML request received - dateTime=' +
          dateTime +
          ' serviceRequestType=' +
          serviceRequestType
      );

      const db = getFirestore();

      const siri = {
        Siri: {
          _attributes: {
            version: '2.0',
            xmlns: 'http://www.siri.org.uk/siri',
            'xmlns:ns2': 'http://www.ifopt.org.uk/acsb',
            'xmlns:ns3': 'http://www.ifopt.org.uk/ifopt',
            'xmlns:ns4': 'http://datex2.eu/schema/2_0RC1/2_0',
          },
        },
      };

      const array = {
        ResponseTimestamp: dateTime,
        ProducerRef: 'ENT',
      };

      try {
        if (serviceRequestType === 'SituationExchangeRequest') {
          const SituationExchangeDelivery =
            await produceSituationExchangeDelivery(db, dateTime);
          array.SituationExchangeDelivery = SituationExchangeDelivery;
        } else if (serviceRequestType === 'EstimatedTimetableRequest') {
          const EstimatedTimetableDelivery =
            await produceEstimatedTimetableDelivery(db, dateTime);
          array.EstimatedTimetableDelivery = EstimatedTimetableDelivery;
        }

        siri.Siri.ServiceDelivery = array;
        const result = convert.js2xml(siri, { compact: true, spaces: 4 });

        response.set('Content-Type', 'text/xml').status(200).send(result);
      } catch (error) {
        console.error('Error in XML requeest: ', error);
        response.status(500);
      }
    });
};

const produceSituationExchangeDelivery = async (db, dateTime) => {
  const open = db
    .collectionGroup('messages')
    .where('Progress', '==', 'open')
    .get();

  const closed = db
    .collectionGroup('messages')
    .where('Progress', '==', 'closed')
    .where('ValidityPeriod.EndTime', '>', dateTime)
    .get();

  const [openSnapshot, closedSnapshot] = await Promise.all([open, closed]);

  const allDocs = openSnapshot.docs.concat(closedSnapshot.docs);
  const situations = { PtSituationElement: [] };

  situations.PtSituationElement = allDocs
    .map((doc) => transformSituationData(doc.data()))
    .filter(filterOpenExpiredMessages(dateTime));

  console.log(
    'Returning number of situations: ' + situations.PtSituationElement.length
  );

  return {
    ResponseTimestamp: dateTime,
    Situations: situations,
  };
};

const produceEstimatedTimetableDelivery = async (db, dateTime) => {
  const cancellations = await db
    .collectionGroup('cancellations')
    .where(
      'EstimatedVehicleJourney.ExpiresAtEpochMs',
      '>',
      addMinutes(new Date(), 10).getTime()
    )
    .get();

  return {
    _attributes: { version: '2.0' },
    ResponseTimestamp: dateTime,
    EstimatedJourneyVersionFrame: {
      RecordedAtTime: dateTime,
      EstimatedVehicleJourney: cancellations.docs.map((doc) =>
        transformCancellationData(doc.data().EstimatedVehicleJourney)
      ),
    },
  };
};

exports.closeOpenExpiredMessages = function () {
  return functions
    .region('europe-west1')
    .pubsub.schedule('every 30 minutes')
    .onRun(async (_) => {
      const dateTime = new Date().toISOString();
      console.info('closeOpenExpiredMessages started - dateTime=' + dateTime);
      const db = getFirestore();

      try {
        const openSnapshot = await db
          .collectionGroup('messages')
          .where('Progress', '==', 'open')
          .get();

        openSnapshot.docs.forEach((docSnapshot) => {
          db.runTransaction((transaction) => {
            return transaction
              .get(docSnapshot.ref)
              .then((doc) => {
                if (
                  doc.data().ValidityPeriod.EndTime &&
                  dateTime > doc.data().ValidityPeriod.EndTime
                ) {
                  const endTime = addHours(
                    parseISO(doc.data().ValidityPeriod.EndTime),
                    5
                  ).toISOString();
                  console.log(
                    `Closing message id=${doc.id} situationNumber=${
                      doc.data().SituationNumber
                    } newEndTime=${endTime}`
                  );
                  transaction.update(docSnapshot.ref, {
                    Progress: 'closed',
                    ValidityPeriod: {
                      StartTime: doc.data().ValidityPeriod.StartTime,
                      EndTime: endTime,
                    },
                  });
                }
              })
              .then(function () {
                console.debug('Transaction successfully committed!');
              })
              .catch(function (error) {
                console.log('Transaction failed: ', error);
              });
          });
        });
      } catch (error) {
        console.error('Error in closeOpenExpiredMessages: ', error);
      }
    });
};

exports.logDbWrites = function () {
  return functions
    .region('europe-west1')
    .firestore.document(
      'codespaces/{codespace}/authorities/{authority}/messages/{messageId}'
    )
    .onWrite((change, context) => {
      const { codespace, authority, messageId } = context.params;

      console.log(
        `Message written: codespace=${codespace} authority=${authority} messageId=${messageId}:\n${JSON.stringify(
          change.after.data()
        )}`
      );
    });
};
