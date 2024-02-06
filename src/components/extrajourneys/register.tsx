import React, { useState } from 'react';
import { Checkbox, CheckboxPanel, RadioGroup, TextField } from '@entur/form';
import {
  DataCell,
  EditableCell,
  HeaderCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@entur/table';
import { Contrast } from '@entur/layout';
import { Button, PrimaryButton, SecondaryButton } from '@entur/button';
import Select from 'react-select';
import { DatePicker } from '@entur/datepicker';
import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
} from '@internationalized/date';
import { useSelectedOrganization } from '../../hooks/useSelectedOrganization';
import { useOperators } from '../../hooks/useOperators';
import { Dropdown } from '@entur/dropdown';

type Call = {
  quay?: string;
  boarding?: boolean;
  alighting?: boolean;
  arrival?: string;
  departure?: string;
};

const Row = ({
  call,
  onChange,
  isFirst,
  isLast,
  onAdd,
}: {
  call: Call;
  onChange: (call: Call) => void;
  isFirst: boolean;
  isLast: boolean;
  onAdd: () => void;
}) => {
  const onFieldChange = <T extends Call, K extends keyof T>(
    key: K,
    value: T[K],
  ) => {
    onChange({
      ...call,
      [key]: value,
    });
  };

  return (
    <TableRow hover>
      <EditableCell>
        <TextField
          aria-label="Platform"
          label=""
          value={call.quay}
          onChange={(e) => onFieldChange('quay', e.target.value)}
        />
      </EditableCell>
      <EditableCell>
        <>
          <Checkbox
            onChange={(e) => onFieldChange('boarding', e.target.checked)}
            disabled={isLast}
            checked={call.boarding}
          >
            Påstigning
          </Checkbox>
          <Checkbox
            onChange={(e) => onFieldChange('alighting', e.target.checked)}
            disabled={isFirst}
            checked={call.alighting}
          >
            Avstigning
          </Checkbox>
        </>
      </EditableCell>
      <EditableCell>
        {!isFirst ? (
          <DatePicker
            showTime
            selectedDate={
              call.arrival ? parseAbsoluteToLocal(call.arrival) : null
            }
            onChange={(e) =>
              onFieldChange('arrival', e?.toDate().toISOString())
            }
            label=""
            aria-label="Ankomst"
          />
        ) : (
          <></>
        )}
      </EditableCell>
      <EditableCell>
        {!isLast ? (
          <DatePicker
            showTime
            selectedDate={
              call.departure ? parseAbsoluteToLocal(call.departure) : null
            }
            onChange={(e) =>
              onFieldChange('departure', e?.toDate().toISOString())
            }
            label=""
            aria-label="Avgang"
          />
        ) : (
          <></>
        )}
      </EditableCell>
      <DataCell>
        {!isLast && <SecondaryButton onClick={onAdd}>Legg til</SecondaryButton>}
      </DataCell>
    </TableRow>
  );
};

type DepartureBoardingActivity = 'boarding' | 'noBoarding';
type ArrivalBoardingActivity = 'alighting' | 'noAlighting';

type EstimatedCall = {
  StopPointRef: string;
  Order: number;
  DestinationDisplay: string;
  AimedArrivalTime?: string;
  ExpectedArrivalTime?: string;
  AimedDepartureTime?: string;
  ExpectedDepartureTime?: string;
  DepartureBoardingActivity?: DepartureBoardingActivity;
  ArrivalBoardingActivity?: ArrivalBoardingActivity;
};

/* air
bus
coach
ferry (mapped to "water")
metro
rail
tram
 */

enum VehicleMode {
  bus = 'bus',
  coach = 'coach',
  ferry = 'ferry',
  metro = 'metro',
  rail = 'rail',
  tram = 'tram',
}

type ExtraJourney = {
  RecordedAtTime: string;
  LineRef: string;
  DirectionRef: '0';
  EstimatedVehicleJourneyCode: string;
  ExtraJourney: true;
  VehicleMode: VehicleMode;
  RouteRef: string;
  PublishedLineName: string;
  GroupOfLinesRef: string;
  ExternalLineRef: string;
  OperatorRef: string;
  Monitored: true;
  EstimatedCalls: EstimatedCall[];
  IsCompleteStopSequence: true;
};

export const Register = () => {
  const selectedOrganization = useSelectedOrganization().split(':')[0];
  const operators = useOperators();
  const [name, setName] = useState<string | undefined>();
  const [mode, setMode] = useState<VehicleMode | undefined>();
  const [destinationDisplay, setDestinationDisplay] = useState<
    string | undefined
  >();
  const [selectedOperator, setSelectedOperator] = useState<
    string | undefined
  >();

  const [calls, setCalls] = useState<Call[]>([
    {
      boarding: true,
      alighting: false,
    },
    {
      boarding: false,
      alighting: true,
    },
  ]);

  const transform: () => ExtraJourney = () => {
    const lineRef = `${selectedOrganization}:Line:${window.crypto.randomUUID()}`;

    // validation
    if (!mode || !name || !destinationDisplay || !selectedOperator) {
      throw new Error('Invalid data');
    }

    const extraJourney: ExtraJourney = {
      RecordedAtTime: now(getLocalTimeZone()).toDate().toISOString(),
      LineRef: lineRef,
      DirectionRef: '0',
      EstimatedVehicleJourneyCode: `${selectedOrganization}:ServiceJourney:${window.crypto.randomUUID()}`,
      ExtraJourney: true,
      VehicleMode: mode,
      RouteRef: `${selectedOrganization}:Route:${window.crypto.randomUUID()}`,
      PublishedLineName: name,
      GroupOfLinesRef: `${selectedOrganization}:Network:${window.crypto.randomUUID()}`,
      ExternalLineRef: lineRef,
      OperatorRef: selectedOperator,
      Monitored: true,
      EstimatedCalls: calls.map((call, i) => ({
        StopPointRef: call.quay!,
        Order: i + 1,
        DestinationDisplay: destinationDisplay,
        AimedArrivalTime: call.arrival,
        ExpectedArrivalTime: call.arrival,
        AimedDepartureTime: call.departure,
        ExpectedDepartureTime: call.departure,
        DepartureBoardingActivity:
          i === calls.length - 1
            ? call.boarding
              ? 'boarding'
              : 'noBoarding'
            : undefined,
        ArrivalBoardingActivity:
          i > 0 ? (call.alighting ? 'alighting' : 'noAlighting') : undefined,
      })),
      IsCompleteStopSequence: true,
    };

    return extraJourney;
  };
  return (
    <>
      <h2 className="text-center text-white">Registrer ny ekstraavgang</h2>

      {/*Published line name*/}
      <TextField
        label="Navn"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />

      <Dropdown
        items={Object.values(VehicleMode)}
        label="Mode"
        selectedItem={{ value: mode || '', label: '' }}
        onChange={(value) => setMode(value?.value as VehicleMode)}
      />

      <Select<VehicleMode>
        placeholder="Select mode"
        // @ts-ignore
        options={Object.values(VehicleMode)}
        value={mode}
        onChange={(newValue) => setMode(newValue ?? undefined)}
      />

      <br />

      <TextField
        label="Destinasjon"
        value={destinationDisplay}
        onChange={(e) => setDestinationDisplay(e.target.value)}
      />

      <br />

      <Select<string>
        placeholder="Select operator"
        // @ts-ignore
        options={operators.map((operator) => operator.id)}
        getOptionLabel={(value) =>
          operators.find((op) => op.id === value)?.name || ''
        }
        value={selectedOperator}
        onChange={(newValue) => setSelectedOperator(newValue as string)}
      />

      <br />

      <Contrast>
        <Table>
          <TableHead>
            <TableRow>
              <HeaderCell>Platform (NSR-id)</HeaderCell>
              <HeaderCell>Av-/påstigning</HeaderCell>
              <HeaderCell>Ankomst</HeaderCell>
              <HeaderCell>Avgang</HeaderCell>
              <HeaderCell>{''}</HeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((call, i) => (
              <Row
                key={i}
                call={call}
                isFirst={i === 0}
                isLast={i === calls.length - 1}
                onChange={(call: Call) => {
                  setCalls([...calls.slice(0, i), call, ...calls.slice(i + 1)]);
                }}
                onAdd={() =>
                  setCalls([
                    ...calls.slice(0, i + 1),
                    {
                      boarding: true,
                      alighting: true,
                    },
                    ...calls.slice(i + 1),
                  ])
                }
              />
            ))}
          </TableBody>
        </Table>

        <br />

        <PrimaryButton onClick={() => console.log(transform())}>
          Opprett ekstraavgang
        </PrimaryButton>
      </Contrast>
    </>
  );
};
