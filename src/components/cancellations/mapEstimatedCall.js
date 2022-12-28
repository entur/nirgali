export const mapEstimatedCall = (
  estimatedCall,
  departureData,
  departureStops
) => {
  const i = estimatedCall.stopPositionInPattern;

  const call = {
    StopPointRef: estimatedCall.quay.id,
    Order: estimatedCall.stopPositionInPattern + 1,
    StopPointName: estimatedCall.quay.name,
    Cancellation: true,
    RequestStop: departureData.passingTimes[i].requestStop,
    AimedArrivalTime: i > 0 ? estimatedCall.aimedArrivalTime : null,
    ExpectedArrivalTime: i > 0 ? estimatedCall.expectedArrivalTime : null,
    AimedDepartureTime:
      i < departureData.estimatedCalls.length - 1
        ? estimatedCall.aimedDepartureTime
        : null,
    ExpectedDepartureTime:
      i < departureData.estimatedCalls.length - 1
        ? estimatedCall.expectedDepartureTime
        : null,
    ArrivalStatus: i > 0 ? 'cancelled' : null,
    ArrivalBoardingActivity: departureData.passingTimes[i].forAlighting
      ? 'alighting'
      : 'noAlighting',
    DepartureStatus:
      i < departureData.estimatedCalls.length - 1 ? 'cancelled' : null,
    DepartureBoardingActivity: departureData.passingTimes[i].forBoarding
      ? 'boarding'
      : 'noBoarding',
  };

  if (
    departureStops.length > 0 &&
    !departureStops.some((stopId) => stopId === estimatedCall.quay.stopPlace.id)
  ) {
    call.Cancellation = false;
    call.ArrivalStatus = i > 0 ? 'onTime' : null;
    call.DepartureStatus =
      i < departureData.estimatedCalls.length - 1 ? 'onTime' : null;
  }

  return call;
};
