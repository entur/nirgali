import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Add from '@mui/icons-material/Add';
import { ExtraJourney } from './types';
import { useExtrajourneys } from '../../hooks/useExtrajourneys';
import { isJourneyActive } from '../../util/formatters';
import { useAppSelector } from '../../store/hooks';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';

interface OverviewProps {
  selectedOrganization: string;
}

export const Overview = ({ selectedOrganization }: OverviewProps) => {
  const navigate = useNavigate();
  const [showCompletedTrips, setShowCompletedTrips] = useState(false);
  const loading = useAppSelector((state) => state.extrajourneys.loading);

  const { extrajourneys } = useExtrajourneys(
    selectedOrganization.split(':')[0],
    selectedOrganization,
    showCompletedTrips,
  );

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Ekstraavganger</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => navigate('/ekstraavganger/ny')}
        >
          Ny ekstraavgang
        </Button>
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={showCompletedTrips}
            onChange={(e) => setShowCompletedTrips(e.target.checked)}
          />
        }
        label="Vis passerte ekstraavganger"
        sx={{ mb: 2 }}
      />

      <Loading isLoading={loading} text="Laster ekstraavganger...">
        <>
          {extrajourneys.length === 0 ? (
            <EmptyState message="Ingen ekstraavganger funnet" />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Linje</TableCell>
                    <TableCell>Tur</TableCell>
                    <TableCell>Fra stasjon</TableCell>
                    <TableCell>Planlagt avgang</TableCell>
                    <TableCell>Til stasjon</TableCell>
                    <TableCell>Planlagt ankomst</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extrajourneys.map((extrajourney: ExtraJourney) => {
                    const evj = extrajourney.estimatedVehicleJourney;
                    const calls = evj.estimatedCalls.estimatedCall;
                    const firstCall = calls[0];
                    const lastCall = calls[calls.length - 1];
                    const active = isJourneyActive(evj.expiresAtEpochMs);

                    return (
                      <TableRow
                        key={evj.estimatedVehicleJourneyCode}
                        hover
                        sx={{ opacity: active ? 1 : 0.6 }}
                      >
                        <TableCell>
                          <Chip
                            label={active ? 'Aktiv' : 'Inaktiv'}
                            color={active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{evj.publishedLineName}</TableCell>
                        <TableCell>{evj.estimatedVehicleJourneyCode}</TableCell>
                        <TableCell>{firstCall.stopPointName}</TableCell>
                        <TableCell>
                          {new Date(
                            Date.parse(firstCall.aimedDepartureTime!),
                          ).toLocaleString(navigator.language, {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>{lastCall.stopPointName}</TableCell>
                        <TableCell>
                          {new Date(
                            Date.parse(lastCall.aimedArrivalTime!),
                          ).toLocaleString(navigator.language, {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </Loading>
    </Box>
  );
};
