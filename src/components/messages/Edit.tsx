import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getLineOption } from '../../util/getLineOption';
import { formatDepartureOption } from '../../util/formatters';
import {
  getAffectType,
  getLineQuayLabels,
  getStopQuayLabels,
  buildUpdatedIssue,
} from './messageHelpers';
import { Message } from '../../reducers/messagesSlice';
import { getLocalTimeZone, now } from '@internationalized/date';
import Page from '../common/Page';
import OverlayLoader from '../common/OverlayLoader';
import ConfirmDialog from '../common/ConfirmDialog';
import { useAppDispatch } from '../../store/hooks';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../reducers/notificationSlice';

interface EditProps {
  messages: Message[];
  organization: string;
  lines: any[];
  api: any;
}

const Edit = ({ messages, organization, lines, api }: EditProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: issueId } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const issue = useMemo(
    () => messages.find(({ id }) => id === issueId),
    [messages, issueId],
  );

  const [serviceJourney, setServiceJourney] = useState<any>(undefined);
  const [from, setFrom] = useState<Date | null>(
    issue?.validityPeriod.startTime
      ? new Date(issue.validityPeriod.startTime)
      : null,
  );
  const [to, setTo] = useState<Date | null>(
    issue?.validityPeriod.endTime
      ? new Date(issue.validityPeriod.endTime)
      : null,
  );
  const [reportType, setReportType] = useState(issue?.reportType ?? 'incident');
  const [summary, setSummary] = useState(issue?.summary.text ?? '');
  const [description, setDescription] = useState(
    issue?.description?.text ?? '',
  );
  const [advice, setAdvice] = useState(issue?.advice?.text ?? '');
  const [infoLinkUri, setInfoLinkUri] = useState(
    issue?.infoLinks?.infoLink.uri ?? '',
  );
  const [infoLinkLabel, setInfoLinkLabel] = useState(
    issue?.infoLinks?.infoLink.label ?? '',
  );

  useEffect(() => {
    const affects = issue?.affects;
    const framedRef =
      affects?.vehicleJourneys?.affectedVehicleJourney?.framedVehicleJourneyRef;
    if (framedRef?.datedVehicleJourneyRef) {
      api
        .getServiceJourney(
          framedRef.datedVehicleJourneyRef,
          framedRef.dataFrameRef,
        )
        .then(({ data }: any) => setServiceJourney(data.serviceJourney));
    }
  }, [issueId, api, issue]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setSaving(true);
      try {
        const newIssue = buildUpdatedIssue(issue, {
          summary,
          description,
          advice,
          from,
          to,
          reportType,
          infoLinkUri,
          infoLinkLabel,
        });
        await api.createOrUpdateMessage(
          organization.split(':')[0],
          organization,
          newIssue,
        );
        dispatch(showSuccessNotification('Lagret', 'Endringene ble lagret'));
        navigate('/');
      } catch {
        dispatch(showErrorNotification('Feil', 'Kunne ikke lagre endringer'));
      } finally {
        setSaving(false);
      }
    },
    [
      issue,
      summary,
      description,
      advice,
      from,
      to,
      reportType,
      infoLinkUri,
      infoLinkLabel,
      api,
      organization,
      navigate,
      dispatch,
    ],
  );

  const handleDeactivate = useCallback(async () => {
    setConfirmDeactivate(false);
    setSaving(true);
    try {
      const update = {
        ...issue,
        progress: 'closed',
        validityPeriod: {
          startTime: issue!.validityPeriod.startTime,
          endTime: now(getLocalTimeZone()).add({ hours: 5 }).toAbsoluteString(),
        },
      };
      await api.createOrUpdateMessage(
        organization.split(':')[0],
        organization,
        update,
      );
      dispatch(
        showSuccessNotification('Deaktivert', 'Meldingen ble deaktivert'),
      );
      navigate('/');
    } catch {
      dispatch(showErrorNotification('Feil', 'Kunne ikke deaktivere melding'));
    } finally {
      setSaving(false);
    }
  }, [issue, organization, api, navigate, dispatch]);

  if (!issue || !lines?.length) return null;

  const messageType = getAffectType(issue?.affects);
  const lineQuayLabels = getLineQuayLabels(issue?.affects, lines);
  const stopQuayLabels = getStopQuayLabels(issue?.affects, lines);
  const lineOption = issue?.affects?.networks?.affectedNetwork?.affectedLine
    ?.lineRef
    ? getLineOption(
        lines,
        issue.affects.networks.affectedNetwork.affectedLine.lineRef,
      )
    : null;
  const departureLabel = serviceJourney
    ? formatDepartureOption(serviceJourney)
    : null;
  const fromDisabled =
    new Date(issue.validityPeriod.startTime).getTime() < Date.now();

  return (
    <Page backButtonTitle="Oversikt" title="Endre avvik">
      <OverlayLoader isLoading={saving} text="Lagrer...">
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Påvirkning
            </Typography>
            {messageType === 'line' && (
              <Box>
                <Chip label={lineOption?.label} sx={{ mb: 1 }} />
                {lineQuayLabels.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {lineQuayLabels.map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            )}
            {messageType === 'departure' && serviceJourney && (
              <Stack direction="row" spacing={1}>
                <Chip
                  label={getLineOption(lines, serviceJourney.line.id)?.label}
                />
                {departureLabel && <Chip label={departureLabel} />}
              </Stack>
            )}
            {messageType === 'stop' && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {stopQuayLabels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Gyldighetsperiode
            </Typography>
            <Stack direction="row" spacing={2}>
              <DateTimePicker
                label="Fra"
                value={from}
                onChange={(d) => d && setFrom(d)}
                disabled={fromDisabled}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DateTimePicker
                label="Til"
                value={to}
                onChange={(d) => setTo(d)}
                minDate={from && from > new Date() ? from : new Date()}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Stack>
          </Paper>

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
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="incident">Incident</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Oppsummering"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              inputProps={{ maxLength: 160 }}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Beskrivelse"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Forslag til reisende"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              multiline
              rows={4}
            />
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Lenke
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

          <Stack direction="row" spacing={2}>
            {issue.progress === 'open' ? (
              <>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setConfirmDeactivate(true)}
                >
                  Deaktiver
                </Button>
                <Button variant="contained" type="submit">
                  Lagre endringer
                </Button>
              </>
            ) : (
              <Button variant="contained" type="submit">
                Aktiver
              </Button>
            )}
          </Stack>
        </Box>
      </OverlayLoader>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deaktiver melding"
        message="Er du sikker på at du vil deaktivere denne avviksmeldingen?"
        onClose={() => setConfirmDeactivate(false)}
        buttons={[
          <Button
            key="cancel"
            variant="outlined"
            onClick={() => setConfirmDeactivate(false)}
          >
            Avbryt
          </Button>,
          <Button
            key="confirm"
            variant="contained"
            color="error"
            onClick={handleDeactivate}
          >
            Deaktiver
          </Button>,
        ]}
      />
    </Page>
  );
};

export default Edit;
