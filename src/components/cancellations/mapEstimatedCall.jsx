export const mapEstimatedCall = (
  estimatedCall,
  departureData,
  departureStops,
) => {
  const i = estimatedCall.stopPositionInPattern;

  const call = {
    stopPointRef: estimatedCall.quay.id,
    order: estimatedCall.stopPositionInPattern + 1,
    stopPointName: estimatedCall.quay.name,
    cancellation: true,
    requestStop: departureData.passingTimes[i].requestStop,
    aimedArrivalTime: i > 0 ? estimatedCall.aimedArrivalTime : null,
    expectedArrivalTime: i > 0 ? estimatedCall.expectedArrivalTime : null,
    aimedDepartureTime:
      i < departureData.estimatedCalls.length - 1
        ? estimatedCall.aimedDepartureTime
        : null,
    expectedDepartureTime:
      i < departureData.estimatedCalls.length - 1
        ? estimatedCall.expectedDepartureTime
        : null,
    arrivalStatus: i > 0 ? 'cancelled' : null,
    arrivalBoardingActivity: departureData.passingTimes[i].forAlighting
      ? 'alighting'
      : 'noAlighting',
    departureStatus:
      i < departureData.estimatedCalls.length - 1 ? 'cancelled' : null,
    departureBoardingActivity: departureData.passingTimes[i].forBoarding
      ? 'boarding'
      : 'noBoarding',
  };

  if (
    departureStops.length > 0 &&
    !departureStops.some((stopId) => stopId === estimatedCall.quay.stopPlace.id)
  ) {
    call.cancellation = false;
    call.arrivalStatus = i > 0 ? 'onTime' : null;
    call.departureStatus =
      i < departureData.estimatedCalls.length - 1 ? 'onTime' : null;
  }

  return call;
};
