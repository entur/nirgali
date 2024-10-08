export const sortBySituationNumber = (a, b) => {
  return sortAsc(
    getSituationNumberSequence(a.situationNumber),
    getSituationNumberSequence(b.situationNumber),
  );
};

const sortAsc = (a, b) => a - b;

const getSituationNumberSequence = (SituationNumber) => {
  return parseInt(SituationNumber.split(':').pop());
};

export const sortCancellationByExpiry = (a, b) => {
  return (
    b.estimatedVehicleJourney.expiresAtEpochMs -
    a.estimatedVehicleJourney.expiresAtEpochMs
  );
};

export const sortServiceJourneyByDepartureTime = (a, b) =>
  Date.parse(a.estimatedCalls[0].aimedDepartureTime) -
  Date.parse(b.estimatedCalls[0].aimedDepartureTime);
