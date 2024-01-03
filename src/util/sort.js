export const sortBySituationNumber = (a, b) => {
  return sortAsc(
    getSituationNumberSequence(a.data.SituationNumber),
    getSituationNumberSequence(b.data.SituationNumber),
  );
};

const sortAsc = (a, b) => a - b;

const getSituationNumberSequence = (SituationNumber) => {
  return parseInt(SituationNumber.split(':').pop());
};

export const sortCancellationByExpiry = (a, b) => {
  return (
    b.data.EstimatedVehicleJourney.ExpiresAtEpochMs -
    a.data.EstimatedVehicleJourney.ExpiresAtEpochMs
  );
};

export const sortServiceJourneyByDepartureTime = (a, b) =>
  Date.parse(a.estimatedCalls[0].aimedDepartureTime) -
  Date.parse(b.estimatedCalls[0].aimedDepartureTime);
