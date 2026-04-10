import { useEffect, useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
      <TableCell sx={{ minWidth: 250 }}>
        <Stack spacing={1}>
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
        </Stack>
      </TableCell>

      <TableCell sx={{ minWidth: 280 }}>
        <Stack spacing={1}>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={call.alighting ?? false}
                  onChange={(e) => onFieldChange('alighting', e.target.checked)}
                  disabled={isFirst}
                  size="small"
                />
              }
              label={<Typography variant="body2">Avstigning</Typography>}
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
              label={<Typography variant="body2">Påstigning</Typography>}
            />
          </FormGroup>

          {!isFirst && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Ankomst
              </Typography>
              <DateTimePicker
                ampm={false}
                value={call.arrival ? new Date(call.arrival) : null}
                onChange={(d) => onFieldChange('arrival', d?.toISOString())}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: validationResult?.arrival?.variant === 'error',
                    helperText: validationResult?.arrival?.feedback,
                  },
                }}
              />
            </Box>
          )}

          {!isLast && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Avgang
              </Typography>
              <DateTimePicker
                ampm={false}
                value={call.departure ? new Date(call.departure) : null}
                onChange={(d) => onFieldChange('departure', d?.toISOString())}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: validationResult?.departure?.variant === 'error',
                    helperText: validationResult?.departure?.feedback,
                  },
                }}
              />
            </Box>
          )}
        </Stack>
      </TableCell>

      <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
        {!isLast && (
          <Button variant="outlined" size="small" onClick={onAdd}>
            Legg til
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};
