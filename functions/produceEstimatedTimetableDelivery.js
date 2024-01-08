const { addMinutes } = require('date-fns');
const { transformCancellationData } = require('./utils');
export const produceEstimatedTimetableDelivery = async (db, dateTime) => {
  const cancellations = await db
    .collectionGroup('cancellations')
    .where(
      'EstimatedVehicleJourney.ExpiresAtEpochMs',
      '>',
      addMinutes(new Date(), 10).getTime(),
    )
    .get();

  return {
    _attributes: { version: '2.0' },
    ResponseTimestamp: dateTime,
    EstimatedJourneyVersionFrame: {
      RecordedAtTime: dateTime,
      EstimatedVehicleJourney: cancellations.docs.map((doc) =>
        transformCancellationData(doc.data().EstimatedVehicleJourney),
      ),
    },
  };
};
