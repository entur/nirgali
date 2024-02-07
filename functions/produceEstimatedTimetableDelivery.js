const { addMinutes } = require('date-fns');
const { transformCancellationData } = require('./transformCancellationData');
const { transformExtraJourneysData } = require('./transformExtraJourneysData');

exports.produceEstimatedTimetableDelivery = async (db, dateTime) => {
  const cancellations = await db
    .collectionGroup('cancellations')
    .where(
      'EstimatedVehicleJourney.ExpiresAtEpochMs',
      '>',
      addMinutes(new Date(), 10).getTime(),
    )
    .get();

  const extraJourneys = await db
    .collectionGroup('extrajourneys')
    .where(
      'EstimatedVehicleJourney.ExpiresAtEpochMs',
      '>',
      addMinutes(new Date(), 10).getTime(),
    )
    .get();

  const cancellationData = cancellations.docs.map((doc) =>
    transformCancellationData(doc.data().EstimatedVehicleJourney),
  );

  const extraJourneysData = extraJourneys.docs.map((doc) =>
    transformExtraJourneysData(doc.data().EstimatedVehicleJourney),
  );

  return {
    _attributes: { version: '2.0' },
    ResponseTimestamp: dateTime,
    EstimatedJourneyVersionFrame: {
      RecordedAtTime: dateTime,
      EstimatedVehicleJourney: [...cancellationData, ...extraJourneysData],
    },
  };
};
