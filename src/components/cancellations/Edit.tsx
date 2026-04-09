import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import StopPicker from '../common/StopPicker';
import { mapEstimatedCall } from './mapEstimatedCall';
import { getLineOption } from '../../util/getLineOption';

interface EditProps {
  cancellations: any[];
  organization: string;
  lines: any[];
  api: any;
  refetch: () => Promise<void>;
}

const Edit = ({
  cancellations,
  organization,
  lines,
  api,
  refetch,
}: EditProps) => {
  const navigate = useNavigate();
  const { id: cancellationId } = useParams<{ id: string }>();

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
        .then(({ data }: any) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [cancellationId, api, cancellation]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      cancellation.estimatedVehicleJourney.cancellation =
        !isDepartureStops && departureStops.length === 0;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall =
        serviceJourney.estimatedCalls.map((call: any) =>
          mapEstimatedCall(call, serviceJourney, departureStops),
        );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      await api.createOrUpdateCancellation(
        codespace,
        organization,
        cancellation,
      );
      await refetch();
      navigate('/kanselleringer');
    },
    [
      api,
      refetch,
      cancellation,
      departureStops,
      isDepartureStops,
      navigate,
      organization,
      serviceJourney,
    ],
  );

  const handleRestore = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      cancellation.estimatedVehicleJourney.cancellation = false;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.forEach(
        (call: any) => {
          call.cancellation = false;

          if (call.arrivalStatus) {
            call.arrivalStatus = 'onTime';
          }

          if (call.arrivalBoardingActivity) {
            const passingTime = serviceJourney?.passingTimes?.find(
              (pt: any) => pt.quay?.id === call.stopPointRef,
            );
            call.arrivalBoardingActivity = passingTime?.forAlighting
              ? 'alighting'
              : 'noAlighting';
          }

          if (call.departureStatus) {
            call.departureStatus = 'onTime';
          }

          if (call.departureBoardingActivity) {
            const passingTime = serviceJourney?.passingTimes?.find(
              (pt: any) => pt.quay?.id === call.stopPointRef,
            );
            call.departureBoardingActivity = passingTime?.forBoarding
              ? 'boarding'
              : 'noBoarding';
          }
        },
      );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      await api.createOrUpdateCancellation(
        codespace,
        organization,
        cancellation,
      );
      await refetch();
      navigate('/kanselleringer');
    },
    [api, refetch, cancellation, navigate, organization, serviceJourney],
  );

  const getLineDepartureOption = (): string | null => {
    const estimatedCall = serviceJourney?.estimatedCalls?.[0];
    if (!estimatedCall?.quay) {
      return `Avgangsinformasjon utilgjengelig (${serviceJourney?.id || 'ukjent'})`;
    }
    const quayName = estimatedCall.quay.name;
    const aimedDepartureTime = estimatedCall.aimedDepartureTime
      .split('T')
      .pop()
      .split(':00+')[0];
    return `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`;
  };

  const getQuayLabels = (): string[] => {
    if (!serviceJourney?.estimatedCalls?.length) return [];
    return cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall
      .filter((call: any) => call.Cancellation)
      .map((call: any) => call.stopPointRef)
      .map(
        (ref: string) =>
          serviceJourney.estimatedCalls.find(
            (call: any) => call.quay?.id === ref,
          )?.quay,
      )
      .filter((v: any) => v !== undefined)
      .map((quay: any) => `${quay.name} - ${quay.id}`);
  };

  if (!cancellation || !lines?.length) {
    return null;
  }

  const isCancelled =
    cancellation.estimatedVehicleJourney.cancellation ||
    cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
      (call: any) => call.Cancellation,
    );

  const isPartiallyCancelled =
    !cancellation.estimatedVehicleJourney.cancellation &&
    cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
      (call: any) => call.cancellation,
    );

  return (
    <Box component="form" onSubmit={handleSubmit} autoComplete="off">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Endre kansellering
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Avgang
      </Typography>

      {serviceJourney && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getLineOption(lines, serviceJourney.line.id)?.label}
            sx={{ mb: 1 }}
          />

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Dato (driftsdøgn)</Typography>
            <DatePicker
              label="Dato"
              value={
                new Date(
                  cancellation.estimatedVehicleJourney.framedVehicleJourneyRef
                    .dataFrameRef,
                )
              }
              disabled
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>

          {getLineDepartureOption() && (
            <Chip label={getLineDepartureOption()} sx={{ mb: 1 }} />
          )}
        </Box>
      )}

      {serviceJourney && isPartiallyCancelled && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {getQuayLabels().map((label) => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      {serviceJourney &&
        !cancellation.estimatedVehicleJourney.cancellation &&
        !isPartiallyCancelled && (
          <>
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
              <Box sx={{ mb: 2 }}>
                <StopPicker
                  isMulti
                  api={api}
                  stops={
                    serviceJourney?.estimatedCalls?.map((ec: any) => ec.quay) ??
                    []
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
          </>
        )}

      <Stack direction="row" spacing={2}>
        {isCancelled ? (
          <Button variant="contained" color="error" onClick={handleRestore}>
            Gjenopprett avgang
          </Button>
        ) : (
          <Button variant="contained" color="error" onClick={handleSubmit}>
            Kanseller avgang
          </Button>
        )}
        <Button variant="outlined" onClick={() => navigate('/kanselleringer')}>
          Lukk uten å lagre
        </Button>
      </Stack>
    </Box>
  );
};

export default Edit;
