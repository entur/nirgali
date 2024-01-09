const transformCancellationData = (data) => {
  const {
    RecordedAtTime,
    LineRef,
    DirectionRef,
    FramedVehicleJourneyRef,
    Cancellation,
    DataSource,
    EstimatedCalls,
    IsCompleteStopSequence,
  } = data;

  return {
    RecordedAtTime,
    LineRef,
    DirectionRef,
    FramedVehicleJourneyRef: {
      DataFrameRef: FramedVehicleJourneyRef.DataFrameRef,
      DatedVehicleJourneyRef: FramedVehicleJourneyRef.DatedVehicleJourneyRef,
    },
    Cancellation,
    DataSource,
    EstimatedCalls: {
      EstimatedCall: EstimatedCalls.EstimatedCall.map(transformEstimatedCall),
    },
    IsCompleteStopSequence,
  };
};

exports.transformCancellationData = transformCancellationData;

const transformEstimatedCall = (estimatedCall) => {
  const {
    StopPointRef,
    Order,
    StopPointName,
    Cancellation,
    RequestStop,
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
    StopPointName,
    Cancellation,
    RequestStop,
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
