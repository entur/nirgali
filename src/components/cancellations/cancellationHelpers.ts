import { mapEstimatedCall } from './mapEstimatedCall';

export const buildNewCancellation = ({
  chosenLine,
  departureDate,
  chosenDeparture,
  isDepartureStops,
  departureStops,
  organization,
  departureData,
}: {
  chosenLine: string;
  departureDate: Date;
  chosenDeparture: string;
  isDepartureStops: boolean;
  departureStops: string[];
  organization: string;
  departureData: any;
}) => ({
  estimatedVehicleJourney: {
    recordedAtTime: new Date().toISOString(),
    lineRef: chosenLine,
    directionRef: '0',
    framedVehicleJourneyRef: {
      dataFrameRef: departureDate.toISOString().split('T')[0],
      datedVehicleJourneyRef: chosenDeparture,
    },
    cancellation: !isDepartureStops && departureStops.length === 0,
    dataSource: organization.split(':')[0],
    estimatedCalls: {
      estimatedCall: departureData.estimatedCalls.map((estimatedCall: any) =>
        mapEstimatedCall(estimatedCall, departureData, departureStops),
      ),
    },
    isCompleteStopSequence: true,
    expiresAtEpochMs:
      Date.parse(
        departureData.estimatedCalls[departureData.estimatedCalls.length - 1]
          .aimedArrivalTime,
      ) +
      600 * 1000,
  },
});

export const restoreCancellationCalls = (
  calls: any[],
  serviceJourney: any,
): any[] => {
  return calls.map((call) => {
    const restored = { ...call, cancellation: false };

    if (restored.arrivalStatus) {
      restored.arrivalStatus = 'onTime';
    }

    if (restored.arrivalBoardingActivity) {
      const passingTime = serviceJourney?.passingTimes?.find(
        (pt: any) => pt.quay?.id === call.stopPointRef,
      );
      restored.arrivalBoardingActivity = passingTime?.forAlighting
        ? 'alighting'
        : 'noAlighting';
    }

    if (restored.departureStatus) {
      restored.departureStatus = 'onTime';
    }

    if (restored.departureBoardingActivity) {
      const passingTime = serviceJourney?.passingTimes?.find(
        (pt: any) => pt.quay?.id === call.stopPointRef,
      );
      restored.departureBoardingActivity = passingTime?.forBoarding
        ? 'boarding'
        : 'noBoarding';
    }

    return restored;
  });
};

export const determineCancellationStatus = (
  estimatedVehicleJourney: any,
): { isCancelled: boolean; isPartiallyCancelled: boolean } => {
  const isCancelled =
    estimatedVehicleJourney.cancellation ||
    estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
      (call: any) => call.Cancellation,
    );

  const isPartiallyCancelled =
    !estimatedVehicleJourney.cancellation &&
    estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
      (call: any) => call.cancellation,
    );

  return { isCancelled, isPartiallyCancelled };
};

export const getQuayLabels = (
  cancellation: any,
  serviceJourney: any,
): string[] => {
  if (!serviceJourney?.estimatedCalls?.length) return [];
  return cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall
    .filter((call: any) => call.Cancellation)
    .map((call: any) => call.stopPointRef)
    .map(
      (ref: string) =>
        serviceJourney.estimatedCalls.find((call: any) => call.quay?.id === ref)
          ?.quay,
    )
    .filter((v: any) => v !== undefined)
    .map((quay: any) => `${quay.name} - ${quay.id}`);
};
