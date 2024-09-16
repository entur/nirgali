import { Call, ExtraJourney, VehicleMode } from './types';
import { getLocalTimeZone, now } from '@internationalized/date';
import { Operator } from '../../hooks/useOperators';

export const mapExtraJourney = ({
  codespace,
  selectedMode,
  name,
  destinationDisplay,
  selectedOperator,
  calls,
}: {
  codespace: string;
  selectedMode?: VehicleMode;
  name?: string;
  destinationDisplay?: string;
  selectedOperator?: Operator;
  calls: Call[];
}): ExtraJourney => {
  const lineRef = `${codespace}:Line:${window.crypto.randomUUID()}`;

  // validation
  if (!selectedMode || !name || !destinationDisplay || !selectedOperator) {
    throw new Error('Invalid data');
  }

  return {
    estimatedVehicleJourney: {
      recordedAtTime: now(getLocalTimeZone()).toDate().toISOString(),
      lineRef: lineRef,
      directionRef: '0',
      estimatedVehicleJourneyCode: `${codespace}:ServiceJourney:${window.crypto.randomUUID()}`,
      extraJourney: true,
      vehicleMode: selectedMode,
      routeRef: `${codespace}:Route:${window.crypto.randomUUID()}`,
      publishedLineName: name,
      groupOfLinesRef: `${codespace}:Network:${window.crypto.randomUUID()}`,
      externalLineRef: lineRef,
      operatorRef: selectedOperator.id,
      monitored: true,
      dataSource: codespace,
      estimatedCalls: {
        estimatedCall: calls.map((call, i) => ({
          stopPointRef: call.quay?.id!,
          stopPointName: call.stopPlaceName!,
          order: i + 1,
          destinationDisplay: destinationDisplay,
          aimedArrivalTime: call.arrival ?? null,
          expectedArrivalTime: call.arrival ?? null,
          aimedDepartureTime: call.departure ?? null,
          expectedDepartureTime: call.departure ?? null,
          departureBoardingActivity:
            i !== calls.length - 1
              ? call.boarding
                ? 'boarding'
                : 'noBoarding'
              : null,
          arrivalBoardingActivity:
            i > 0 ? (call.alighting ? 'alighting' : 'noAlighting') : null,
        })),
      },
      isCompleteStopSequence: true,
      expiresAtEpochMs: Date.parse(calls[calls.length - 1].arrival!),
    },
  };
};
