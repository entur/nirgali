import { useEffect, useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { StopPlaceAutocomplete } from './StopPlaceAutocomplete';
import { QuaySelect } from './QuaySelect';
import { Call, GeocodedStopPlace, VehicleMode } from './types';
import { CallValidationResult } from './validate';

interface RegisterEstimatedCallRowProps {
  call: Call;
  onChange: (call: Call) => void;
  isFirst: boolean;
  isLast: boolean;
  onAdd: () => void;
  mode?: VehicleMode;
  validationResult?: CallValidationResult;
}

export const RegisterEstimatedCallRow = ({
  call,
  onChange,
  isFirst,
  isLast,
  onAdd,
  mode,
  validationResult,
}: RegisterEstimatedCallRowProps) => {
  const onFieldChange = <K extends keyof Call>(key: K, value: Call[K]) => {
    onChange({ ...call, [key]: value });
  };

  const [selectedStopPlace, setSelectedStopPlace] = useState<
    GeocodedStopPlace | undefined
  >();

  useEffect(() => {
    if (
      selectedStopPlace &&
      call.stopPlaceName !== selectedStopPlace.properties.name
    ) {
      onChange({ ...call, stopPlaceName: selectedStopPlace.properties.name });
    }
  }, [selectedStopPlace, call, onChange]);

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
        </Box>
      </TableCell>
      <TableCell>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={call.alighting ?? false}
                onChange={(e) => onFieldChange('alighting', e.target.checked)}
                disabled={isFirst}
                size="small"
              />
            }
            label="Avstigning"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={call.boarding ?? false}
                onChange={(e) => onFieldChange('boarding', e.target.checked)}
                disabled={isLast}
                size="small"
              />
            }
            label="Påstigning"
          />
        </FormGroup>
      </TableCell>
      <TableCell>
        {!isFirst && (
          <DateTimePicker
            ampm={false}
            value={call.arrival ? new Date(call.arrival) : null}
            onChange={(d) => onFieldChange('arrival', d?.toISOString())}
            slotProps={{
              textField: {
                size: 'small',
                error: validationResult?.arrival?.variant === 'error',
                helperText: validationResult?.arrival?.feedback,
                'aria-label': 'Ankomst',
              },
            }}
          />
        )}
      </TableCell>
      <TableCell>
        {!isLast && (
          <DateTimePicker
            ampm={false}
            value={call.departure ? new Date(call.departure) : null}
            onChange={(d) => onFieldChange('departure', d?.toISOString())}
            slotProps={{
              textField: {
                size: 'small',
                error: validationResult?.departure?.variant === 'error',
                helperText: validationResult?.departure?.feedback,
                'aria-label': 'Avgang',
              },
            }}
          />
        )}
      </TableCell>
      <TableCell>
        {!isLast && (
          <Button variant="outlined" size="small" onClick={onAdd}>
            Legg til
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};
