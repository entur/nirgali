import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import { getLocalTimeZone, now } from '@internationalized/date';
import LinePicker from '../common/LinePicker';
import StopPicker from '../common/StopPicker';
import Page from '../common/Page';
import OverlayLoader from '../common/OverlayLoader';
import { sortServiceJourneyByDepartureTime } from '../../util/sort';
import {
  createNewIssue,
  buildAffects,
  buildValidityPeriod,
  addInfoLink,
} from './messageHelpers';
import { AffectType } from './types';
import { useAppDispatch } from '../../store/hooks';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../reducers/notificationSlice';

interface RegisterProps {
  api: any;
  lines: any[];
  organization: string;
}

const STEPS = ['Velg påvirkning', 'Gyldighetsperiode', 'Meldingsinnhold'];

const Register = ({ api, lines, organization }: RegisterProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<AffectType | undefined>();
  const [chosenLine, setChosenLine] = useState<string | undefined>();
  const [datedVehicleJourney, setDatedVehicleJourney] = useState<
    string | undefined
  >();
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [departures, setDepartures] = useState<any[]>([]);
  const [showDepartureSearch, setShowDepartureSearch] = useState(false);
  const [specifyStopsLine, setSpecifyStopsLine] = useState(false);
  const [specifyStopsDeparture, setSpecifyStopsDeparture] = useState(false);
  const [multipleStops, setMultipleStops] = useState<
    { value: string; label: string }[]
  >([]);
  const [reportType, setReportType] = useState('incident');
  const [oppsummering, setOppsummering] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [forslag, setForslag] = useState('');
  const [infoLinkUri, setInfoLinkUri] = useState('');
  const [infoLinkLabel, setInfoLinkLabel] = useState('');
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date | null>(null);

  const step1Complete =
    (type === 'line' && !!chosenLine) ||
    (type === 'stop' && multipleStops.length > 0) ||
    (type === 'departure' && !!datedVehicleJourney);

  const step2Complete = type === 'departure' || !!from;
  const step3Complete = !!oppsummering;

  const handleChangeType = useCallback((value: AffectType) => {
    setType(value);
    setChosenLine(undefined);
    setSpecifyStopsLine(false);
    setSpecifyStopsDeparture(false);
    setShowDepartureSearch(false);
    setDepartures([]);
    setDatedVehicleJourney(undefined);
    setMultipleStops([]);
  }, []);

  const handleChangeLine = useCallback(
    (option: { value: string } | null) => {
      if (!option) return;
      setChosenLine(option.value);
      if (type === 'departure') {
        setShowDepartureSearch(false);
        setDepartures([]);
        setDatedVehicleJourney(undefined);
      }
    },
    [type],
  );

  const callApiDeparture = useCallback(async () => {
    if (!chosenLine || !departureDate) return;
    const dateStr = departureDate.toISOString().split('T')[0];
    const response = await api.getDepartures(chosenLine, dateStr);
    setDepartures(structuredClone(response.data.serviceJourneys));
    setShowDepartureSearch(true);
  }, [chosenLine, departureDate, api]);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      const dateNow = now(getLocalTimeZone());
      const issue = createNewIssue(
        organization,
        dateNow,
        reportType,
        oppsummering,
        beskrivelse,
        forslag,
      );

      issue.affects = buildAffects(
        type,
        chosenLine,
        specifyStopsLine,
        specifyStopsDeparture,
        multipleStops,
        departureDate,
        datedVehicleJourney,
      );

      issue.validityPeriod = buildValidityPeriod(
        type,
        departureDate,
        { toAbsoluteString: () => from.toISOString() },
        to ? { toAbsoluteString: () => to.toISOString() } : undefined,
      );

      addInfoLink(
        issue,
        infoLinkUri
          ? { uri: infoLinkUri, label: infoLinkLabel || undefined }
          : undefined,
      );

      const codespace = organization.split(':')[0];
      await api.createOrUpdateMessage(codespace, organization, issue);
      dispatch(
        showSuccessNotification(
          'Melding opprettet',
          'Avviksmeldingen ble lagret',
        ),
      );
      navigate('/');
    } catch {
      dispatch(showErrorNotification('Feil', 'Kunne ikke opprette melding'));
    } finally {
      setSaving(false);
    }
  }, [
    organization,
    reportType,
    oppsummering,
    beskrivelse,
    forslag,
    type,
    chosenLine,
    specifyStopsLine,
    specifyStopsDeparture,
    multipleStops,
    departureDate,
    datedVehicleJourney,
    from,
    to,
    infoLinkUri,
    infoLinkLabel,
    api,
    navigate,
    dispatch,
  ]);

  const stops =
    lines?.reduce((acc: any[], line: any) => [...acc, ...line.quays], []) ?? [];

  const serviceJourneyOptions = departures
    .sort(sortServiceJourneyByDepartureTime)
    .map((item: any) => ({
      label:
        item.estimatedCalls[0].aimedDepartureTime
          .split('T')
          .pop()
          .split(':00+')[0] +
        ' fra ' +
        item.estimatedCalls[0].quay.name +
        ' (' +
        item.id +
        ')',
      value: item.id,
    }));

  const selectedLineQuays = chosenLine
    ? (lines?.find((l: any) => l.id === chosenLine)?.quays ?? [])
    : [];

  const selectedDepartureQuays =
    datedVehicleJourney && departures
      ? (departures
          .find((d: any) => d.id === datedVehicleJourney)
          ?.estimatedCalls.map((ec: any) => ec.quay) ?? [])
      : [];

  return (
    <Page backButtonTitle="Oversikt" title="Registrer ny melding">
      <OverlayLoader isLoading={saving} text="Lagrer melding...">
        <>
          <Stepper activeStep={activeStep} nonLinear sx={{ mb: 4 }}>
            {STEPS.map((label, index) => (
              <Step
                key={label}
                completed={
                  index === 0
                    ? step1Complete
                    : index === 1
                      ? step2Complete
                      : step3Complete
                }
              >
                <StepButton onClick={() => setActiveStep(index)}>
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Velg hva avviket gjelder
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel>Velg linje, stopp eller avgang</InputLabel>
                <Select
                  value={type ?? ''}
                  label="Velg linje, stopp eller avgang"
                  onChange={(e) =>
                    handleChangeType(e.target.value as AffectType)
                  }
                >
                  <MenuItem value="line">Linje</MenuItem>
                  <MenuItem value="stop">Stopp</MenuItem>
                  <MenuItem value="departure">Avgang</MenuItem>
                </Select>
              </FormControl>

              {lines && (type === 'line' || type === 'departure') && (
                <Box sx={{ mb: 2 }}>
                  <LinePicker lines={lines} onChange={handleChangeLine} />
                </Box>
              )}

              {type === 'line' && chosenLine && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={specifyStopsLine}
                      onChange={(e) => setSpecifyStopsLine(e.target.checked)}
                    />
                  }
                  label="Gjelder avviket for spesifikke stopp?"
                  sx={{ mb: 2 }}
                />
              )}

              {type === 'line' && chosenLine && specifyStopsLine && (
                <Box sx={{ mb: 2 }}>
                  <StopPicker
                    sort
                    isMulti
                    api={api}
                    stops={selectedLineQuays}
                    onChange={(options) =>
                      setMultipleStops(Array.isArray(options) ? options : [])
                    }
                  />
                </Box>
              )}

              {type === 'stop' && stops.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Du er i ferd med å lage en avviksmelding som treffer all
                    rutegående trafikk som passerer de(n) valgte holdeplassen(e)
                    på tvers av operatører.
                  </Alert>
                  <StopPicker
                    sort
                    isMulti
                    api={api}
                    stops={stops}
                    onChange={(options) =>
                      setMultipleStops(Array.isArray(options) ? options : [])
                    }
                  />
                </Box>
              )}

              {type === 'departure' && chosenLine && (
                <Box sx={{ mb: 2 }}>
                  <MuiDatePicker
                    label="Dato"
                    value={departureDate}
                    onChange={(d) => d && setDepartureDate(d)}
                    minDate={new Date()}
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={callApiDeparture}
                  >
                    Søk avganger
                  </Button>
                </Box>
              )}

              {showDepartureSearch && departures.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    options={serviceJourneyOptions}
                    getOptionLabel={(o: any) => o.label}
                    isOptionEqualToValue={(o: any, v: any) =>
                      o.value === v.value
                    }
                    onChange={(_, newValue: any) =>
                      setDatedVehicleJourney(newValue?.value)
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Velg avgang" size="small" />
                    )}
                  />
                </Box>
              )}

              {type === 'departure' && datedVehicleJourney && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={specifyStopsDeparture}
                      onChange={(e) =>
                        setSpecifyStopsDeparture(e.target.checked)
                      }
                    />
                  }
                  label="Gjelder avviket for spesifikke stopp?"
                  sx={{ mb: 2 }}
                />
              )}

              {type === 'departure' && specifyStopsDeparture && (
                <Box sx={{ mb: 2 }}>
                  <StopPicker
                    isMulti
                    api={api}
                    stops={selectedDepartureQuays}
                    onChange={(options) =>
                      setMultipleStops(Array.isArray(options) ? options : [])
                    }
                  />
                </Box>
              )}
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Gyldighetsperiode
              </Typography>
              {type === 'departure' ? (
                <Alert severity="info">
                  Gyldighetsperioden settes automatisk til avgangsdatoen.
                </Alert>
              ) : (
                <Stack direction="row" spacing={2}>
                  <DateTimePicker
                    label="Fra"
                    value={from}
                    onChange={(d) => d && setFrom(d)}
                    minDate={new Date()}
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />
                  <DateTimePicker
                    label="Til"
                    value={to}
                    onChange={(d) => setTo(d)}
                    minDate={from}
                    slotProps={{
                      textField: { size: 'small', fullWidth: true },
                    }}
                  />
                </Stack>
              )}
            </Paper>
          )}

          {activeStep === 2 && (
            <>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Melding
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }} size="small">
                  <InputLabel>Avvikstype</InputLabel>
                  <Select
                    value={reportType}
                    label="Avvikstype"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="incident">Incident</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Kort, beskrivende avvikstekst"
                  value={oppsummering}
                  onChange={(e) => setOppsummering(e.target.value)}
                  inputProps={{ maxLength: 160 }}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Utdypende detaljer (valgfritt)"
                  value={beskrivelse}
                  onChange={(e) => setBeskrivelse(e.target.value)}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Forslag til reisende (valgfritt)"
                  value={forslag}
                  onChange={(e) => setForslag(e.target.value)}
                  multiline
                  rows={4}
                />
              </Paper>

              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Lenke til nettside
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="URL"
                  value={infoLinkUri}
                  onChange={(e) => setInfoLinkUri(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Lenketekst"
                  value={infoLinkLabel}
                  onChange={(e) => setInfoLinkLabel(e.target.value)}
                />
              </Paper>
            </>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => setActiveStep(activeStep - 1)}
              >
                Forrige
              </Button>
            )}
            {activeStep < 2 && (
              <Button
                variant="contained"
                onClick={() => setActiveStep(activeStep + 1)}
                disabled={activeStep === 0 && !step1Complete}
              >
                Neste
              </Button>
            )}
            {activeStep === 2 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!step1Complete || !step3Complete}
              >
                Registrer melding
              </Button>
            )}
          </Stack>
        </>
      </OverlayLoader>
    </Page>
  );
};

export default Register;
