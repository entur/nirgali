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
    EstimatedVehicleJourney: {
      RecordedAtTime: now(getLocalTimeZone()).toDate().toISOString(),
      LineRef: lineRef,
      DirectionRef: '0',
      EstimatedVehicleJourneyCode: `${codespace}:ServiceJourney:${window.crypto.randomUUID()}`,
      ExtraJourney: true,
      VehicleMode: selectedMode,
      RouteRef: `${codespace}:Route:${window.crypto.randomUUID()}`,
      PublishedLineName: name,
      GroupOfLinesRef: `${codespace}:Network:${window.crypto.randomUUID()}`,
      ExternalLineRef: lineRef,
      OperatorRef: selectedOperator.id,
      Monitored: true,
      DataSource: codespace,
      EstimatedCalls: {
        EstimatedCall: calls.map((call, i) => ({
          StopPointRef: call.quay?.id!,
          StopPointName: call.stopPlaceName!,
          Order: i + 1,
          DestinationDisplay: destinationDisplay,
          AimedArrivalTime: call.arrival ?? null,
          ExpectedArrivalTime: call.arrival ?? null,
          AimedDepartureTime: call.departure ?? null,
          ExpectedDepartureTime: call.departure ?? null,
          DepartureBoardingActivity:
            i !== calls.length - 1
              ? call.boarding
                ? 'boarding'
                : 'noBoarding'
              : null,
          ArrivalBoardingActivity:
            i > 0 ? (call.alighting ? 'alighting' : 'noAlighting') : null,
        })),
      },
      IsCompleteStopSequence: true,
      ExpiresAtEpochMs: Date.parse(calls[calls.length - 1].arrival!),
    },
  };
};
