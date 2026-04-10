import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { EstimatedCall } from './types';
import { QuayEditSelect } from './QuayEditSelect';

interface DetailEstimatedCallRowProps {
  call: EstimatedCall;
  isFirst: boolean;
  isLast: boolean;
  onChange: (updated: EstimatedCall) => void;
}

const formatTime = (iso: string | null): string => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const DetailEstimatedCallRow = ({
  call,
  isFirst,
  isLast,
  onChange,
}: DetailEstimatedCallRowProps) => {
  const isCancelled = call.cancellation ?? false;

  const handleCancelToggle = (cancelled: boolean) => {
    onChange({
      ...call,
      cancellation: cancelled,
      arrivalStatus: !isFirst ? (cancelled ? 'cancelled' : 'onTime') : null,
      departureStatus: !isLast ? (cancelled ? 'cancelled' : 'onTime') : null,
    } as EstimatedCall);
  };

  return (
    <TableRow hover sx={{ opacity: isCancelled ? 0.5 : 1 }}>
      <TableCell sx={{ minWidth: 220 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {call.stopPointName}
        </Typography>
        <QuayEditSelect
          currentQuayId={call.stopPointRef}
          onChange={(quay) => onChange({ ...call, stopPointRef: quay.id })}
          disabled={isCancelled}
        />
      </TableCell>

      <TableCell sx={{ minWidth: 170 }}>
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Ankomst
          </Typography>
          <Typography variant="body2">
            {!isFirst ? formatTime(call.aimedArrivalTime) : '-'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Avgang
          </Typography>
          <Typography variant="body2">
            {!isLast ? formatTime(call.aimedDepartureTime) : '-'}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={{ minWidth: 220 }}>
        {!isFirst && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Ankomst
            </Typography>
            <DateTimePicker
              ampm={false}
              value={
                call.expectedArrivalTime
                  ? new Date(call.expectedArrivalTime)
                  : null
              }
              onChange={(d) =>
                onChange({
                  ...call,
                  expectedArrivalTime: d?.toISOString() ?? null,
                })
              }
              disabled={isCancelled}
              slotProps={{
                textField: { size: 'small', fullWidth: true },
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
              value={
                call.expectedDepartureTime
                  ? new Date(call.expectedDepartureTime)
                  : null
              }
              onChange={(d) =>
                onChange({
                  ...call,
                  expectedDepartureTime: d?.toISOString() ?? null,
                })
              }
              disabled={isCancelled}
              slotProps={{
                textField: { size: 'small', fullWidth: true },
              }}
            />
          </Box>
        )}
      </TableCell>

      <TableCell>
        <Stack spacing={0.5} alignItems="flex-start">
          {call.departureBoardingActivity && (
            <Chip
              label={
                call.departureBoardingActivity === 'boarding'
                  ? 'Påstigning'
                  : 'Ingen påst.'
              }
              size="small"
              variant="outlined"
            />
          )}
          {call.arrivalBoardingActivity && (
            <Chip
              label={
                call.arrivalBoardingActivity === 'alighting'
                  ? 'Avstigning'
                  : 'Ingen avst.'
              }
              size="small"
              variant="outlined"
            />
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={isCancelled}
                onChange={(e) => handleCancelToggle(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Kanseller</Typography>
            }
          />
        </Stack>
      </TableCell>
    </TableRow>
  );
};
