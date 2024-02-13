const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const convert = require('xml-js');
const {
  produceSituationExchangeDelivery,
} = require('./produceSituationExchangeDelivery');
const {
  produceEstimatedTimetableDelivery,
} = require('./produceEstimatedTimetableDelivery');

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
          serviceRequestType,
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
          array.SituationExchangeDelivery =
            await produceSituationExchangeDelivery(db, dateTime);
        } else if (serviceRequestType === 'EstimatedTimetableRequest') {
          array.EstimatedTimetableDelivery =
            await produceEstimatedTimetableDelivery(db, dateTime);
        }

        siri.Siri.ServiceDelivery = array;
        const result = convert.js2xml(siri, { compact: true, spaces: 4 });

        response.set('Content-Type', 'text/xml').status(200).send(result);
      } catch (error) {
        console.error('Error in XML request: ', error);
        response.status(500);
      }
    });
};
