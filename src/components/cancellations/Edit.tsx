import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import StopPicker from '../common/StopPicker';
import Page from '../common/Page';
import OverlayLoader from '../common/OverlayLoader';
import ConfirmDialog from '../common/ConfirmDialog';
import { mapEstimatedCall } from './mapEstimatedCall';
import { getLineOption } from '../../util/getLineOption';
import { formatDepartureOption } from '../../util/formatters';
import {
  restoreCancellationCalls,
  determineCancellationStatus,
  getQuayLabels,
} from './cancellationHelpers';
import { useAppDispatch } from '../../store/hooks';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../reducers/notificationSlice';

interface EditProps {
  cancellations: any[];
  organization: string;
  lines: any[];
  api: any;
  refetch: () => any;
}

const Edit = ({
  cancellations,
  organization,
  lines,
  api,
  refetch,
}: EditProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id: cancellationId } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    'cancel' | 'restore' | null
  >(null);

  const cancellation = useMemo(
    () => cancellations.find(({ id }: any) => id === cancellationId),
    [cancellations, cancellationId],
  );

  const [serviceJourney, setServiceJourney] = useState<any>(undefined);
  const [isDepartureStops, setIsDepartureStops] = useState(false);
  const [departureStops, setDepartureStops] = useState<string[]>([]);

  useEffect(() => {
    if (cancellation) {
      const { datedVehicleJourneyRef, dataFrameRef } =
        cancellation.estimatedVehicleJourney.framedVehicleJourneyRef;
      api
        .getServiceJourney(datedVehicleJourneyRef, dataFrameRef)
        .then(({ data }: any) => setServiceJourney(data.serviceJourney));
    }
  }, [cancellationId, api, cancellation]);

  const executeCancellation = useCallback(async () => {
    setConfirmAction(null);
    setSaving(true);
    try {
      cancellation.estimatedVehicleJourney.cancellation =
        !isDepartureStops && departureStops.length === 0;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall =
        serviceJourney.estimatedCalls.map((call: any) =>
          mapEstimatedCall(call, serviceJourney, departureStops),
        );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      await api.createOrUpdateCancellation(
        organization.split(':')[0],
        organization,
        cancellation,
      );
      await refetch();
      dispatch(
        showSuccessNotification('Kansellert', 'Avgangen ble kansellert'),
      );
      navigate('/kanselleringer');
    } catch {
      dispatch(showErrorNotification('Feil', 'Kunne ikke kansellere avgang'));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    refetch,
    cancellation,
    departureStops,
    isDepartureStops,
    navigate,
    organization,
    serviceJourney,
    dispatch,
  ]);

  const executeRestore = useCallback(async () => {
    setConfirmAction(null);
    setSaving(true);
    try {
      cancellation.estimatedVehicleJourney.cancellation = false;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall =
        restoreCancellationCalls(
          cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall,
          serviceJourney,
        );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      await api.createOrUpdateCancellation(
        organization.split(':')[0],
        organization,
        cancellation,
      );
      await refetch();
      dispatch(
        showSuccessNotification('Gjenopprettet', 'Avgangen ble gjenopprettet'),
      );
      navigate('/kanselleringer');
    } catch {
      dispatch(showErrorNotification('Feil', 'Kunne ikke gjenopprette avgang'));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    refetch,
    cancellation,
    navigate,
    organization,
    serviceJourney,
    dispatch,
  ]);

  if (!cancellation || !lines?.length) return null;

  const { isCancelled, isPartiallyCancelled } = determineCancellationStatus(
    cancellation.estimatedVehicleJourney,
  );
  const departureLabel = serviceJourney
    ? formatDepartureOption(serviceJourney)
    : null;
  const quayLabels = getQuayLabels(cancellation, serviceJourney);

  return (
    <Page backButtonTitle="Oversikt" title="Endre kansellering">
      <OverlayLoader isLoading={saving} text="Lagrer...">
        <>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Avgang
            </Typography>
            {serviceJourney && (
              <Stack spacing={2}>
                <Chip
                  label={getLineOption(lines, serviceJourney.line.id)?.label}
                  sx={{ alignSelf: 'flex-start' }}
                />
                <DatePicker
                  label="Dato (driftsdøgn)"
                  value={
                    new Date(
                      cancellation.estimatedVehicleJourney
                        .framedVehicleJourneyRef.dataFrameRef,
                    )
                  }
                  disabled
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                {departureLabel && (
                  <Chip
                    label={departureLabel}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                )}
              </Stack>
            )}
          </Paper>

          {serviceJourney && isPartiallyCancelled && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Kansellerte stopp
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {quayLabels.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>
          )}

          {serviceJourney &&
            !cancellation.estimatedVehicleJourney.cancellation &&
            !isPartiallyCancelled && (
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Omfang
                </Typography>
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
                {isDepartureStops && (
                  <StopPicker
                    isMulti
                    api={api}
                    stops={
                      serviceJourney?.estimatedCalls?.map(
                        (ec: any) => ec.quay,
                      ) ?? []
                    }
                    onChange={(options) => {
                      if (Array.isArray(options)) {
                        setDepartureStops(options.map((o: any) => o.value));
                      } else {
                        setDepartureStops([]);
                      }
                    }}
                  />
                )}
              </Paper>
            )}

          <Stack direction="row" spacing={2}>
            {isCancelled ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmAction('restore')}
              >
                Gjenopprett avgang
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmAction('cancel')}
              >
                Kanseller avgang
              </Button>
            )}
          </Stack>
        </>
      </OverlayLoader>

      <ConfirmDialog
        open={confirmAction === 'cancel'}
        title="Kanseller avgang"
        message="Er du sikker på at du vil kansellere denne avgangen?"
        onClose={() => setConfirmAction(null)}
        buttons={[
          <Button
            key="no"
            variant="outlined"
            onClick={() => setConfirmAction(null)}
          >
            Avbryt
          </Button>,
          <Button
            key="yes"
            variant="contained"
            color="error"
            onClick={executeCancellation}
          >
            Kanseller
          </Button>,
        ]}
      />

      <ConfirmDialog
        open={confirmAction === 'restore'}
        title="Gjenopprett avgang"
        message="Er du sikker på at du vil gjenopprette denne avgangen?"
        onClose={() => setConfirmAction(null)}
        buttons={[
          <Button
            key="no"
            variant="outlined"
            onClick={() => setConfirmAction(null)}
          >
            Avbryt
          </Button>,
          <Button key="yes" variant="contained" onClick={executeRestore}>
            Gjenopprett
          </Button>,
        ]}
      />
    </Page>
  );
};

export default Edit;
