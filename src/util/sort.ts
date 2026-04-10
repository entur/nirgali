export const sortBySituationNumber = (
  a: { situationNumber: string },
  b: { situationNumber: string },
): number => {
  return sortAsc(
    getSituationNumberSequence(a.situationNumber),
    getSituationNumberSequence(b.situationNumber),
  );
};

const sortAsc = (a: number, b: number): number => a - b;

const getSituationNumberSequence = (situationNumber: string): number => {
  return parseInt(situationNumber.split(':').pop()!);
};

export const sortCancellationByExpiry = (
  a: { estimatedVehicleJourney: { expiresAtEpochMs: number } },
  b: { estimatedVehicleJourney: { expiresAtEpochMs: number } },
): number => {
  return (
    b.estimatedVehicleJourney.expiresAtEpochMs -
    a.estimatedVehicleJourney.expiresAtEpochMs
  );
};

export const sortServiceJourneyByDepartureTime = (
  a: { estimatedCalls: { aimedDepartureTime: string }[] },
  b: { estimatedCalls: { aimedDepartureTime: string }[] },
): number =>
  Date.parse(a.estimatedCalls[0].aimedDepartureTime) -
  Date.parse(b.estimatedCalls[0].aimedDepartureTime);
