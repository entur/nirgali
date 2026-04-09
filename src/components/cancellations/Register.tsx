import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import LinePicker from '../common/LinePicker';
import StopPicker from '../common/StopPicker';
import { mapEstimatedCall } from './mapEstimatedCall';
import { sortServiceJourneyByDepartureTime } from '../../util/sort';
import { getLocalTimeZone, now, toCalendarDate } from '@internationalized/date';

interface RegisterProps {
  lines: any[];
  api: any;
  organization: string;
  refetch: () => Promise<void>;
}

export const Register = ({
  lines,
  api,
  organization,
  refetch,
}: RegisterProps) => {
  const navigate = useNavigate();
  const [chosenLine, setChosenLine] = useState<string | null>(null);
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [departures, setDepartures] = useState<any[]>([]);
  const [chosenDeparture, setChosenDeparture] = useState<string | null>(null);
  const [isDepartureStops, setIsDepartureStops] = useState(false);
  const [departureStops, setDepartureStops] = useState<string[]>([]);

  const handleChangeLine = useCallback(
    (option: { value: string } | null) => setChosenLine(option?.value ?? null),
    [],
  );

  const serviceJourneyOptions = useMemo(() => {
    return departures
      .filter(
        (sj: any) =>
          Date.parse(
            sj.estimatedCalls[sj.estimatedCalls.length - 1].aimedArrivalTime,
          ) > now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime(),
      )
      .sort(sortServiceJourneyByDepartureTime)
      .map((item: any) => ({
        label:
          new Date(
            Date.parse(item.estimatedCalls[0].aimedDepartureTime),
          ).toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          }) +
          ' fra ' +
          item.estimatedCalls[0].quay.name +
          ' (' +
          item.id +
          ')',
        value: item.id,
      }));
  }, [departures]);

  const callApiDeparture = useCallback(async () => {
    if (!chosenLine || !departureDate) return;
    const dateStr = departureDate.toISOString().split('T')[0];
    const response = await api.getDepartures(chosenLine, dateStr);
    setDepartures(response.data.serviceJourneys);
  }, [chosenLine, departureDate, api]);

  const handleSubmit = useCallback(async () => {
    const departureData = departures.find((d: any) => d.id === chosenDeparture);
    if (!departureData) return;

    const newCancellation = {
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
          estimatedCall: departureData.estimatedCalls.map(
            (estimatedCall: any) =>
              mapEstimatedCall(estimatedCall, departureData, departureStops),
          ),
        },
        isCompleteStopSequence: true,
        expiresAtEpochMs:
          Date.parse(
            departureData.estimatedCalls[
              departureData.estimatedCalls.length - 1
            ].aimedArrivalTime,
          ) +
          600 * 1000,
      },
    };

    await api.createOrUpdateCancellation(
      organization.split(':')[0],
      organization,
      newCancellation,
    );
    await refetch();
    navigate('/kanselleringer');
  }, [
    api,
    refetch,
    chosenDeparture,
    chosenLine,
    departureDate,
    departureStops,
    departures,
    isDepartureStops,
    navigate,
    organization,
  ]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Registrer ny kansellering
      </Typography>

      {lines && (
        <Box sx={{ mb: 2 }}>
          <LinePicker lines={lines} onChange={handleChangeLine} />
        </Box>
      )}

      {chosenLine && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Dato (driftsdøgn)
          </Typography>
          <DatePicker
            label="Velg dato"
            value={departureDate}
            onChange={(d) => d && setDepartureDate(d)}
            minDate={new Date()}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            sx={{ mb: 1 }}
          />
          <Button variant="contained" fullWidth onClick={callApiDeparture}>
            Søk avganger
          </Button>
        </Box>
      )}

      {chosenLine && departures.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Autocomplete
            options={serviceJourneyOptions}
            getOptionLabel={(o: any) => o.label}
            isOptionEqualToValue={(o: any, v: any) => o.value === v.value}
            onChange={(_, newValue: any) =>
              setChosenDeparture(newValue?.value ?? null)
            }
            renderInput={(params) => (
              <TextField {...params} label="Velg avgang" size="small" />
            )}
          />
        </Box>
      )}

      {chosenDeparture && (
        <FormControlLabel
          control={
            <Checkbox
              checked={isDepartureStops}
              onChange={(e) => setIsDepartureStops(e.target.checked)}
            />
          }
          label="Gjelder kanselleringen for spesifikke stopp?"
          sx={{ mb: 2 }}
        />
      )}

      {chosenDeparture && isDepartureStops && (
        <Box sx={{ mb: 2 }}>
          <StopPicker
            isMulti
            api={api}
            stops={
              departures
                .find(({ id }: any) => id === chosenDeparture)
                ?.estimatedCalls.map((ec: any) => ec.quay) ?? []
            }
            onChange={(options) => {
              if (Array.isArray(options)) {
                setDepartureStops(options.map((o: any) => o.value));
              } else {
                setDepartureStops([]);
              }
            }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          disabled={chosenDeparture === null}
          onClick={handleSubmit}
        >
          Registrer
        </Button>
        <Button variant="outlined" onClick={() => navigate('/kanselleringer')}>
          Tilbake
        </Button>
      </Stack>
    </Box>
  );
};
