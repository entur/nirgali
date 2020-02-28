const functions = require('firebase-functions');
const convert = require('xml-js');

exports.xml = function(admin) {
    return functions.https.onRequest((request, response) => {
        if (request.method !== "POST") {
            const xmlString =
                '<?xml version="1.0" encoding="UTF-8"?><Response><Message><Body>This endpoint only handles POST requests</Body></Message></Response>';
            response
                .set("Content-Type", "text/xml; charset=utf8")
                .status(200)
                .send(xmlString);
        }

        console.info('XML request received');

        let date = new Date().getDate(); if(date < 10){ date = "0"+date }
        let month = new Date().getMonth() + 1; if(month < 10){ month = "0"+month }
        let year = new Date().getFullYear();
        let hours = new Date().getHours(); if(hours < 10){ hours = "0"+hours }
        let min = new Date().getMinutes(); if(min < 10){ min = "0"+min }
        let sec = new Date().getSeconds(); if(sec < 10){ sec = "0"+sec }

        const dateTime = year + '-' + month + '-' + date +'T' + hours + ':' + min + ':' + sec+"+02:00";


        const db = admin.firestore();

        const siri = {
            Siri: {
                _attributes: {
                    version: "2.0" ,
                    xmlns: "http://www.siri.org.uk/siri",
                    'xmlns:ns2': "http://www.ifopt.org.uk/acsb",
                    'xmlns:ns3': "http://www.ifopt.org.uk/ifopt",
                    'xmlns:ns4': "http://datex2.eu/schema/2_0RC1/2_0"
                },
            }
        };

        const array = {
            ResponseTimestamp: dateTime,
            ProducerRef: "ENT",
            SituationExchangeDelivery: {
                ResponseTimestamp: dateTime,
                Situations: [],
            }
        };


        db.collectionGroup('messages').get().then(querySnapshot => {
            const situations = {PtSituationElement: []};
            querySnapshot.forEach((doc) => {
                if (Date.parse(doc.data().ValidityPeriod.EndTime) < Date.parse(dateTime)) {
                    // ignore validity period end time before current time
                } else {
                    const swapPlaces = doc.data();
                    const tmp = {};
                    tmp['CreationTime'] = swapPlaces.CreationTime;
                    tmp['ParticipantRef'] = swapPlaces.ParticipantRef;
                    tmp['SituationNumber'] = swapPlaces.SituationNumber;
                    tmp['Source'] = swapPlaces.Source;
                    tmp['Progress'] = swapPlaces.Progress;
                    tmp['ValidityPeriod'] = swapPlaces.ValidityPeriod;
                    if(tmp.ValidityPeriod.EndTime){
                        const endTime = tmp.ValidityPeriod.EndTime;
                        delete tmp.ValidityPeriod.EndTime;
                        tmp.ValidityPeriod['EndTime'] = endTime;
                    }
                    tmp['UndefinedReason'] = {};
                    tmp['Severity'] = swapPlaces.Severity;
                    tmp['ReportType'] = swapPlaces.ReportType;
                    tmp['Summary'] = swapPlaces.Summary;
                    if(swapPlaces.Description){ tmp['Description'] = swapPlaces.Description; }
                    tmp['Affects'] = swapPlaces.Affects;
                    if(tmp.Affects.Networks) {
                        if(tmp.Affects.Networks.AffectedNetwork.AffectedLine.Routes){
                            const routes = tmp.Affects.Networks.AffectedNetwork.AffectedLine.Routes;
                            delete tmp.Affects.Networks.AffectedNetwork.AffectedLine.Routes;
                            tmp.Affects.Networks.AffectedNetwork.AffectedLine['Routes'] = routes;
                        }
                    }
                    situations.PtSituationElement.push(tmp)
                }
            });

            array.SituationExchangeDelivery.Situations.push(situations);
            siri.Siri.ServiceDelivery = array;

            const result = convert.js2xml(siri, {compact: true, spaces: 4});
            response
                .set("Content-Type", "text/xml")
                .status(200)
                .send(result);
        });
    });
}
