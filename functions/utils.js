/**
 * Transforms situation data to a structure suitable for xml serialization.
 *
 * Contains some hacks to force the order of some elements to be correct according to the
 * XSD specification: <parent>: <element-one-before> -> <element-two-after>
 * ValidityPeriod: StartTime -> EndTime
 * AffectedLine: LineRef -> Routes
 *
 * The hack relies on the implementation specific fact that string object keys are enumerated in the
 * order they were added. This is the only way to preserve order when using the compact form options
 * of the xml serializer: https://www.npmjs.com/package/xml-js#convert-js-object--json-%E2%86%92-xml
 *
 * In the future, it would be preferable to tie the database model less to the XML specification,
 * and have specific serializers that provide a more deterministic method.
 *
 */
const transformSituationData = (data) => {
  const {
    CreationTime,
    ParticipantRef,
    SituationNumber,
    Source,
    Progress,
    ValidityPeriod,
    Severity,
    ReportType,
    Summary,
    Description,
    Advice,
    Affects,
    InfoLinks,
  } = data;

  const transformedData = {
    CreationTime,
    ParticipantRef,
    SituationNumber,
    Source,
    Progress,
    ValidityPeriod: transformValidityPeriod(ValidityPeriod),
    UndefinedReason: {},
    Severity,
    ReportType,
    Summary,
  };

  if (Description) {
    transformedData.Description = Description;
  }

  if (Advice) {
    transformedData.Advice = Advice;
  }

  transformedData.Affects = transformAffects(Affects);

  if (InfoLinks) {
    transformedData.InfoLinks = InfoLinks;
  }

  return transformedData;
};

const transformAffects = ({
  Networks,
  StopPlaces,
  StopPoints,
  VehicleJourneys,
}) => {
  const transformedAffects = {};

  if (Networks) {
    transformedAffects.Networks = transformNetworks(Networks);
  }

  if (StopPlaces) {
    transformedAffects.StopPlaces = StopPlaces;
  }

  if (StopPoints) {
    transformedAffects.StopPoints = StopPoints;
  }

  if (VehicleJourneys) {
    transformedAffects.VehicleJourneys =
      transformVehicleJourneys(VehicleJourneys);
  }

  return transformedAffects;
};

const transformVehicleJourneys = (VehicleJourneys) => {
  const {
    AffectedVehicleJourney: {
      FramedVehicleJourneyRef: { DataFrameRef, DatedVehicleJourneyRef },
      Route,
    },
  } = VehicleJourneys;

  return {
    AffectedVehicleJourney: {
      FramedVehicleJourneyRef: {
        DataFrameRef,
        DatedVehicleJourneyRef,
      },
      Route,
    },
  };
};

const transformNetworks = (Networks) => {
  const {
    AffectedNetwork: {
      AffectedLine: { Routes, LineRef },
    },
  } = Networks;

  const transformedNetworks = {
    AffectedNetwork: {
      AffectedLine: {
        LineRef,
      },
    },
  };

  if (Routes) {
    transformedNetworks.AffectedNetwork.AffectedLine.Routes = Routes;
  }

  return transformedNetworks;
};

const transformValidityPeriod = ({ StartTime, EndTime }) => {
  const transformedValidityPeriod = {
    StartTime,
  };

  if (EndTime) {
    transformedValidityPeriod.EndTime = EndTime;
  }

  return transformedValidityPeriod;
};

exports.transformSituationData = transformSituationData;

const filterOpenExpiredMessages = (dateTime) => (data) => {
  if (data.Progress === 'open' && data.ValidityPeriod.EndTime) {
    return data.ValidityPeriod.EndTime > dateTime;
  }
  return true;
};

exports.filterOpenExpiredMessages = filterOpenExpiredMessages;

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

  if (AimedDepartureTime) {
    transformedData.AimedDepartureTime = AimedDepartureTime;
  }

  if (ExpectedDepartureTime) {
    transformedData.ExpectedDepartureTime = ExpectedDepartureTime;
  }

  return {
    ...transformedData,
    DepartureStatus,
    DepartureBoardingActivity,
  };
};
