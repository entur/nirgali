const functions = require('firebase-functions');
const convert = require('xml-js');
const {transformSituationData, filterOpenExpiredMessages} = require('./utils');

exports.xml = function(admin) {
  return functions.https.onRequest(async (request, response) => {
    if (request.method !== 'POST') {
      const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>This endpoint only handles POST requests</Body></Message></Response>';
      response
        .set('Content-Type', 'text/xml; charset=utf8')
        .status(200)
        .send(xmlString);
    }

    const dateTime = new Date().toISOString();

    console.info('XML request received - dateTime=' + dateTime);

    const db = admin.firestore();

    const siri = {
      Siri: {
        _attributes: {
          version: '2.0',
          xmlns: 'http://www.siri.org.uk/siri',
          'xmlns:ns2': 'http://www.ifopt.org.uk/acsb',
          'xmlns:ns3': 'http://www.ifopt.org.uk/ifopt',
          'xmlns:ns4': 'http://datex2.eu/schema/2_0RC1/2_0'
        }
      }
    };

    const array = {
      ResponseTimestamp: dateTime,
      ProducerRef: 'ENT',
      SituationExchangeDelivery: {
        ResponseTimestamp: dateTime,
        Situations: []
      }
    };

    const open = db
      .collectionGroup('messages')
      .where('Progress', '==', 'open')
      .get();

    const closed = db
      .collectionGroup('messages')
      .where('Progress', '==', 'closed')
      .where('ValidityPeriod.EndTime', '>', dateTime)
      .get();

    try {
      const [openSnapshot, closedSnapshot] = await Promise.all([open, closed]);

      const allDocs = openSnapshot.docs.concat(closedSnapshot.docs);
      const situations = { PtSituationElement: [] };

      situations.PtSituationElement = allDocs
        .map(doc => transformSituationData(doc.data()))
        .filter(filterOpenExpiredMessages(dateTime));

      array.SituationExchangeDelivery.Situations.push(situations);
      siri.Siri.ServiceDelivery = array;

      const result = convert.js2xml(siri, { compact: true, spaces: 4 });

      console.log(
        'Returning number of situations: ' +
          situations.PtSituationElement.length
      );

      response
        .set('Content-Type', 'text/xml')
        .status(200)
        .send(result);
    } catch (e) {
      console.error('Error in XML requeest', e);
      response.status(500);
    }
  });
};

exports.closeOpenExpiredMessages = function(admin) {
  return functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const dateTime = new Date().toISOString();
    console.info('closeOpenExpiredMessages started - dateTime=' + dateTime);
    const db = admin.firestore();

    try {
      const openSnapshot = await db
        .collectionGroup('messages')
        .where('Progress', '==', 'open')
        .get();

        openSnapshot.forEach(doc => {
          if (doc.data().ValidityPeriod.EndTime && doc.data().ValidityPeriod.EndTime > dateTime) {
            doc.update({
              Progress: 'closed'
            })
          }
        })
    } catch (e) {
      console.error('error in closeExpiredMessages', e);
    }
  });
}
