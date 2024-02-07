const transformExtraJourneysData = (data) => {
  const {
    RecordedAtTime,
    LineRef,
    DirectionRef,
    EstimatedVehicleJourneyCode,
    ExtraJourney,
    VehicleMode,
    RouteRef,
    PublishedLineName,
    GroupOfLinesRef,
    ExternalLineRef,
    OperatorRef,
    Monitored,
    DataSource,
    EstimatedCalls,
    IsCompleteStopSequence,
  } = data;

  return {
    RecordedAtTime,
    LineRef,
    DirectionRef,
    EstimatedVehicleJourneyCode,
    ExtraJourney,
    VehicleMode,
    RouteRef,
    PublishedLineName,
    GroupOfLinesRef,
    ExternalLineRef,
    OperatorRef,
    Monitored,
    DataSource,
    EstimatedCalls: {
      EstimatedCall: EstimatedCalls.EstimatedCall.map(transformEstimatedCall),
    },
    IsCompleteStopSequence,
  };
};

exports.transformExtraJourneysData = transformExtraJourneysData;

const transformEstimatedCall = (estimatedCall) => {
  const {
    StopPointRef,
    Order,
    DestinationDisplay,
    AimedArrivalTime,
    ExpectedArrivalTime,
    AimedDepartureTime,
    ExpectedDepartureTime,
    ArrivalStatus,
    ArrivalBoardingActivity,
    DepartureStatus,
    DepartureBoardingActivity,
  } = estimatedCall;

  const transformedData = {
    StopPointRef,
    Order,
    DestinationDisplay,
  };

  if (AimedArrivalTime) {
    transformedData.AimedArrivalTime = AimedArrivalTime;
  }

  if (ExpectedArrivalTime) {
    transformedData.ExpectedArrivalTime = ExpectedArrivalTime;
  }

  if (ArrivalStatus) {
    transformedData.ArrivalStatus = ArrivalStatus;
  }

  if (ArrivalBoardingActivity) {
    transformedData.ArrivalBoardingActivity = ArrivalBoardingActivity;
  }

  if (AimedDepartureTime) {
    transformedData.AimedDepartureTime = AimedDepartureTime;
  }

  if (ExpectedDepartureTime) {
    transformedData.ExpectedDepartureTime = ExpectedDepartureTime;
  }

  if (DepartureStatus) {
    transformedData.DepartureStatus = DepartureStatus;
  }

  if (DepartureBoardingActivity) {
    transformedData.DepartureBoardingActivity = DepartureBoardingActivity;
  }

  return transformedData;
};
