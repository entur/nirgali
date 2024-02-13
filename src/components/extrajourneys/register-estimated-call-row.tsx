import { Call, GeocodedStopPlace, VehicleMode } from './types';
import React, { useEffect, useState } from 'react';
import { DataCell, EditableCell, TableRow } from '@entur/table';
import { StopPlaceAutocomplete } from './stop-place-autocomplete';
import { QuaySelect } from './quay-select';
import { Checkbox, Fieldset } from '@entur/form';
import { DatePicker } from '@entur/datepicker';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { SecondaryButton } from '@entur/button';
import { CallValidationResult } from './validate';

export const RegisterEstimatedCallRow = ({
  call,
  onChange,
  isFirst,
  isLast,
  onAdd,
  mode,
  validationResult,
}: {
  call: Call;
  onChange: (call: Call) => void;
  isFirst: boolean;
  isLast: boolean;
  onAdd: () => void;
  mode?: VehicleMode;
  validationResult?: CallValidationResult;
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

  const [selectedStopPlace, setSelectedStopPlace] = useState<
    GeocodedStopPlace | undefined
  >();

  useEffect(() => {
    if (
      selectedStopPlace &&
      call.stopPlaceName !== selectedStopPlace.properties.name
    ) {
      onChange({
        ...call,
        stopPlaceName: selectedStopPlace.properties.name,
      });
    }
  }, [selectedStopPlace, call, onChange]);

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
            validationResult={validationResult?.quay}
            selectedStopPlace={selectedStopPlace}
            value={call.quay}
            onChange={(quay) => onFieldChange('quay', quay)}
          />
        </>
      </EditableCell>
      <EditableCell>
        <Fieldset {...validationResult?.alighting}>
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
        </Fieldset>
      </EditableCell>
      <EditableCell>
        {!isFirst ? (
          <DatePicker
            {...validationResult?.arrival}
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
            {...validationResult?.departure}
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
