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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getLineOption } from '../../util/getLineOption';
import { Message } from '../../reducers/messagesSlice';
import { getLocalTimeZone, now } from '@internationalized/date';

interface EditProps {
  messages: Message[];
  organization: string;
  lines: any[];
  api: any;
}

const Edit = ({ messages, organization, lines, api }: EditProps) => {
  const navigate = useNavigate();
  const { id: issueId } = useParams<{ id: string }>();

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
    const framedVehicleJourneyRef =
      affects?.vehicleJourneys?.affectedVehicleJourney?.framedVehicleJourneyRef;
    const datedVehicleJourneyRef =
      framedVehicleJourneyRef?.datedVehicleJourneyRef;
    const dataFrameRef = framedVehicleJourneyRef?.dataFrameRef;

    if (datedVehicleJourneyRef) {
      api
        .getServiceJourney(datedVehicleJourneyRef, dataFrameRef)
        .then(({ data }: any) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [issueId, api, issue]);

  const getType = (): string => {
    if (issue?.affects?.networks?.affectedNetwork?.affectedLine?.lineRef)
      return 'line';
    if (
      issue?.affects?.vehicleJourneys?.affectedVehicleJourney
        ?.framedVehicleJourneyRef
    )
      return 'departure';
    if (issue?.affects?.stopPoints) return 'stop';
    return '';
  };

  const getLine = () => {
    const lineRef =
      issue?.affects?.networks?.affectedNetwork?.affectedLine?.lineRef;
    return getLineOption(lines, lineRef);
  };

  const getLineDepartureOption = () => {
    if (!serviceJourney?.estimatedCalls?.length) return null;
    const estimatedCall = serviceJourney.estimatedCalls[0];
    const quayName = estimatedCall.quay.name;
    const aimedDepartureTime = estimatedCall.aimedDepartureTime
      .split('T')
      .pop()
      .split(':00+')[0];
    return `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`;
  };

  const getLineQuayLabels = (): string[] => {
    const affectedLine =
      issue?.affects?.networks?.affectedNetwork?.affectedLine;
    const stopPoints =
      affectedLine?.routes?.affectedRoute?.stopPoints?.affectedStopPoint;
    if (!stopPoints) return [];
    return stopPoints
      .map((sp: any) => {
        const lineRef = affectedLine.lineRef;
        const line = lines?.find((l: any) => l.id === lineRef);
        const quay = line?.quays?.find(
          (q: any) => q.stopPlace?.id === sp.stopPointRef,
        );
        return quay ? `${quay.name} - ${quay.stopPlace.id}` : null;
      })
      .filter(Boolean);
  };

  const getStopQuayLabels = (): string[] => {
    const stopPoints = issue?.affects?.stopPoints?.affectedStopPoint;
    if (!stopPoints) return [];
    const quays = lines?.reduce(
      (acc: any[], line: any) => [...acc, ...line.quays],
      [],
    );
    return stopPoints
      .map((sp: any) => {
        const quay = quays?.find(
          (q: any) => q.stopPlace?.id === sp.stopPointRef,
        );
        return quay ? `${quay.name} - ${quay.stopPlace.id}` : null;
      })
      .filter(Boolean);
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const newIssue = { ...issue } as any;
      newIssue.progress = 'open';
      newIssue.summary = { attributes: { xmlLang: 'NO' }, text: summary };

      if (description) {
        newIssue.description = {
          attributes: { xmlLang: 'NO' },
          text: description,
        };
      } else {
        delete newIssue.description;
      }

      if (advice) {
        newIssue.advice = { attributes: { xmlLang: 'NO' }, text: advice };
      } else {
        delete newIssue.advice;
      }

      if (from) {
        newIssue.validityPeriod.startTime = from.toISOString();
      }
      if (to) {
        newIssue.validityPeriod.endTime = to.toISOString();
      }
      newIssue.reportType = reportType;

      if (infoLinkUri) {
        newIssue.infoLinks = {
          infoLink: { uri: infoLinkUri, label: infoLinkLabel || undefined },
        };
      } else {
        delete newIssue.infoLinks;
      }

      await api.createOrUpdateMessage(
        organization.split(':')[0],
        organization,
        newIssue,
      );
      navigate('/');
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
    ],
  );

  const handleDeactivate = useCallback(async () => {
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
    navigate('/');
  }, [issue, organization, api, navigate]);

  if (!issue || !lines?.length) {
    return null;
  }

  const messageType = getType();
  const fromDisabled =
    new Date(issue.validityPeriod.startTime).getTime() < Date.now();

  return (
    <Box component="form" onSubmit={handleSubmit} autoComplete="off">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Endre avvik
      </Typography>

      {messageType === 'line' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Linje
          </Typography>
          <Chip label={getLine()?.label} sx={{ mb: 1 }} />
          {getLineQuayLabels().length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {getLineQuayLabels().map((label) => (
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

      {messageType === 'departure' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Avgang
          </Typography>
          {serviceJourney && (
            <>
              <Chip
                label={getLineOption(lines, serviceJourney.line.id)?.label}
                sx={{ mb: 1 }}
              />
              {getLineDepartureOption() && (
                <Chip label={getLineDepartureOption()} sx={{ ml: 1, mb: 1 }} />
              )}
            </>
          )}
        </Box>
      )}

      {messageType === 'stop' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Stopp
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {getStopQuayLabels().map((label) => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Gyldighetsperiode
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Melding
      </Typography>
      <TextField
        fullWidth
        size="small"
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
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Lenke til nettside
      </Typography>
      <TextField
        fullWidth
        size="small"
        label="Lenke"
        value={infoLinkUri}
        onChange={(e) => setInfoLinkUri(e.target.value)}
        sx={{ mb: 1 }}
      />
      <TextField
        fullWidth
        size="small"
        label="Tekst til lenken"
        value={infoLinkLabel}
        onChange={(e) => setInfoLinkLabel(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={2}>
        {issue.progress === 'open' ? (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeactivate}
            >
              Deaktiver
            </Button>
            <Button variant="outlined" type="submit">
              Lagre endringer
            </Button>
          </>
        ) : (
          <Button variant="outlined" type="submit">
            Aktiver
          </Button>
        )}
        <Button variant="text" onClick={() => navigate('/')}>
          Lukk uten å lagre
        </Button>
      </Stack>
    </Box>
  );
};

export default Edit;
