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
import { Operator, useOperators } from '../../hooks/useOperators';
import { Dropdown } from '@entur/dropdown';
import { StopPlaceAutocomplete } from './stop-place-autocomplete';
import { QuaySelect } from './quay-select';
import { Call, ExtraJourney, VehicleMode } from './types';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';

const Row = ({
  call,
  onChange,
  isFirst,
  isLast,
  onAdd,
  mode,
}: {
  call: Call;
  onChange: (call: Call) => void;
  isFirst: boolean;
  isLast: boolean;
  onAdd: () => void;
  mode?: VehicleMode;
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

  const [selectedStopPlace, setSelectedStopPlace] = useState<any | undefined>();

  return (
    <TableRow hover>
      <EditableCell>
        <>
          <StopPlaceAutocomplete
            mode={mode}
            value={selectedStopPlace}
            onChange={setSelectedStopPlace}
          />
          <QuaySelect
            selectedStopPlace={selectedStopPlace?.value}
            value={call.quay}
            onChange={(quay) => onFieldChange('quay', quay)}
          />
        </>
      </EditableCell>
      <EditableCell>
        <>
          <Checkbox
            onChange={(e) => onFieldChange('alighting', e.target.checked)}
            disabled={isFirst}
            checked={call.alighting}
          >
            Avstigning
          </Checkbox>
          <Checkbox
            onChange={(e) => onFieldChange('boarding', e.target.checked)}
            disabled={isLast}
            checked={call.boarding}
          >
            Påstigning
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

export const Register = () => {
  const selectedOrganization = useSelectedOrganization();
  const operators = useOperators();
  const [name, setName] = useState<string | undefined>();
  const [mode, setMode] = useState<VehicleMode | undefined>();
  const [destinationDisplay, setDestinationDisplay] = useState<
    string | undefined
  >();
  const [selectedOperator, setSelectedOperator] = useState<
    Operator | undefined
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

  const navigate = useNavigate();

  const codespace = selectedOrganization.split(':')[0];

  const transform: () => ExtraJourney = () => {
    const lineRef = `${codespace}:Line:${window.crypto.randomUUID()}`;

    // validation
    if (!mode || !name || !destinationDisplay || !selectedOperator) {
      throw new Error('Invalid data');
    }

    const extraJourney: ExtraJourney = {
      RecordedAtTime: now(getLocalTimeZone()).toDate().toISOString(),
      LineRef: lineRef,
      DirectionRef: '0',
      EstimatedVehicleJourneyCode: `${codespace}:ServiceJourney:${window.crypto.randomUUID()}`,
      ExtraJourney: true,
      VehicleMode: mode,
      RouteRef: `${codespace}:Route:${window.crypto.randomUUID()}`,
      PublishedLineName: name,
      GroupOfLinesRef: `${codespace}:Network:${window.crypto.randomUUID()}`,
      ExternalLineRef: lineRef,
      OperatorRef: selectedOperator.id,
      Monitored: true,
      EstimatedCalls: calls.map((call, i) => ({
        StopPointRef: call.quay?.value!,
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
      IsCompleteStopSequence: true,
    };

    return extraJourney;
  };

  const submit = async () => {
    const extraJourney = transform();

    const db = firebase.firestore();
    await db
      .collection(
        `codespaces/${codespace}/authorities/${selectedOrganization}/extrajourneys`,
      )
      .doc()
      .set(extraJourney);

    navigate('/ekstraavganger');
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
        selectedItem={mode ? { value: mode || '', label: `${mode}` } : null}
        onChange={(value) => setMode(value?.value as VehicleMode)}
      />

      <br />

      <TextField
        label="Destinasjon"
        value={destinationDisplay}
        onChange={(e) => setDestinationDisplay(e.target.value)}
      />

      <br />

      <Dropdown
        items={() =>
          operators.map((operator) => ({
            value: operator.id,
            label: `${operator.name} (${operator.id})`,
          }))
        }
        label="Operator"
        selectedItem={
          selectedOperator
            ? {
                value: selectedOperator?.id,
                label: `${selectedOperator?.name} (${selectedOperator?.id})`,
              }
            : null
        }
        onChange={(value) =>
          setSelectedOperator(
            operators.find((operator) => operator.id === value?.value),
          )
        }
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
                mode={mode}
              />
            ))}
          </TableBody>
        </Table>

        <br />

        <PrimaryButton onClick={() => submit()}>
          Opprett ekstraavgang
        </PrimaryButton>
      </Contrast>
    </>
  );
};
