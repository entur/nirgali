import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Page from '../common/Page';
import OverlayLoader from '../common/OverlayLoader';
import ConfirmDialog from '../common/ConfirmDialog';
import { DetailEstimatedCallRow } from './DetailEstimatedCallRow';
import { ExtraJourney, EstimatedCall } from './types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../reducers/notificationSlice';
import { isJourneyActive } from '../../util/formatters';
import { loadExtrajourneys } from '../../reducers/extrajourneysSlice';
import api from '../../api/api';
import { useConfig } from '../../config/ConfigContext';
import { useAuth } from 'react-oidc-context';

interface DetailProps {
  selectedOrganization: string;
}

export const Detail = ({ selectedOrganization }: DetailProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: journeyId } = useParams<{ id: string }>();
  const config = useConfig();
  const auth = useAuth();
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const extrajourneys = useAppSelector((state) => state.extrajourneys.data);

  const extrajourney = useMemo(
    () => extrajourneys.find((ej) => ej.id === journeyId),
    [extrajourneys, journeyId],
  );

  const [editedCalls, setEditedCalls] = useState<EstimatedCall[] | null>(null);

  // Initialize editable calls from the source data
  const calls =
    editedCalls ??
    extrajourney?.estimatedVehicleJourney.estimatedCalls.estimatedCall ??
    [];

  const handleCallChange = useCallback(
    (index: number, updated: EstimatedCall) => {
      const newCalls = [...calls];
      newCalls[index] = updated;
      setEditedCalls(newCalls);
    },
    [calls],
  );

  const codespace = selectedOrganization.split(':')[0];

  const handleSave = useCallback(async () => {
    if (!extrajourney) return;
    setSaving(true);
    try {
      const updated = structuredClone(extrajourney);
      updated.estimatedVehicleJourney.estimatedCalls.estimatedCall = calls;
      updated.estimatedVehicleJourney.recordedAtTime = new Date().toISOString();

      await api(config, auth).createOrUpdateExtrajourney(
        codespace,
        selectedOrganization,
        updated,
      );
      await dispatch(
        loadExtrajourneys({
          config,
          auth,
          codespace,
          authority: selectedOrganization,
          showCompletedTrips: true,
        }),
      );
      dispatch(
        showSuccessNotification('Lagret', 'Ekstraavgangen ble oppdatert'),
      );
      navigate('/ekstraavganger');
    } catch {
      dispatch(showErrorNotification('Feil', 'Kunne ikke lagre endringer'));
    } finally {
      setSaving(false);
    }
  }, [
    extrajourney,
    calls,
    config,
    auth,
    codespace,
    selectedOrganization,
    dispatch,
    navigate,
  ]);

  const handleCancelJourney = useCallback(async () => {
    if (!extrajourney) return;
    setConfirmCancel(false);
    setSaving(true);
    try {
      const updated = structuredClone(extrajourney);
      updated.estimatedVehicleJourney.cancellation = true;
      updated.estimatedVehicleJourney.estimatedCalls.estimatedCall.forEach(
        (call: EstimatedCall) => {
          call.cancellation = true;
          if (call.arrivalBoardingActivity) call.arrivalStatus = 'cancelled';
          if (call.departureBoardingActivity)
            call.departureStatus = 'cancelled';
        },
      );
      updated.estimatedVehicleJourney.recordedAtTime = new Date().toISOString();

      await api(config, auth).createOrUpdateExtrajourney(
        codespace,
        selectedOrganization,
        updated,
      );
      await dispatch(
        loadExtrajourneys({
          config,
          auth,
          codespace,
          authority: selectedOrganization,
          showCompletedTrips: true,
        }),
      );
      dispatch(
        showSuccessNotification('Kansellert', 'Ekstraavgangen ble kansellert'),
      );
      navigate('/ekstraavganger');
    } catch {
      dispatch(
        showErrorNotification('Feil', 'Kunne ikke kansellere ekstraavgang'),
      );
    } finally {
      setSaving(false);
    }
  }, [
    extrajourney,
    config,
    auth,
    codespace,
    selectedOrganization,
    dispatch,
    navigate,
  ]);

  if (!extrajourney) return null;

  const evj = extrajourney.estimatedVehicleJourney;
  const journeyCancelled = evj.cancellation ?? false;
  const expired = !isJourneyActive(evj.expiresAtEpochMs);
  const editable = !expired && !journeyCancelled;

  return (
    <Page backButtonTitle="Oversikt" title="Ekstraavgang">
      <OverlayLoader isLoading={saving} text="Lagrer...">
        <>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h5">Turdetaljer</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={expired ? 'Utløpt' : 'Aktiv'}
                  color={expired ? 'default' : 'success'}
                  size="small"
                />
                {journeyCancelled && (
                  <Chip label="Kansellert" color="error" size="small" />
                )}
              </Stack>
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="ID"
              value={evj.estimatedVehicleJourneyCode}
              disabled
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            evj.estimatedVehicleJourneyCode,
                          )
                        }
                        aria-label="Kopier ID"
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="Navn"
              value={evj.publishedLineName}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Mode"
              value={evj.vehicleMode}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Destinasjon"
              value={
                evj.estimatedCalls.estimatedCall[0]?.destinationDisplay ?? ''
              }
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Operatør"
              value={evj.operatorRef}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Linje"
              value={evj.lineRef}
              disabled
            />
          </Paper>

          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Stopp
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Stoppested</TableCell>
                    <TableCell>Planlagte tider</TableCell>
                    <TableCell>Forventede tider</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calls.map((call, i) => (
                    <DetailEstimatedCallRow
                      key={call.stopPointRef + i}
                      call={call}
                      isFirst={i === 0}
                      isLast={i === calls.length - 1}
                      onChange={(updated) => handleCallChange(i, updated)}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {editable && (
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave}>
                Lagre endringer
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmCancel(true)}
              >
                Kanseller ekstraavgang
              </Button>
            </Stack>
          )}
        </>
      </OverlayLoader>

      <ConfirmDialog
        open={confirmCancel}
        title="Kanseller ekstraavgang"
        message="Er du sikker på at du vil kansellere hele ekstraavgangen? Alle stopp vil bli markert som kansellert."
        onClose={() => setConfirmCancel(false)}
        buttons={[
          <Button
            key="no"
            variant="outlined"
            onClick={() => setConfirmCancel(false)}
          >
            Avbryt
          </Button>,
          <Button
            key="yes"
            variant="contained"
            color="error"
            onClick={handleCancelJourney}
          >
            Kanseller
          </Button>,
        ]}
      />
    </Page>
  );
};
