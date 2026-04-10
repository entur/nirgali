import { useCallback, useMemo, useState } from 'react';
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
import { sortCancellationByExpiry } from '../../util/sort';
import { isJourneyActive, getCancellationLabel } from '../../util/formatters';
import { useAppSelector } from '../../store/hooks';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';

interface OverviewProps {
  cancellations: any[];
  lines: any[];
}

const Overview = ({ cancellations, lines }: OverviewProps) => {
  const navigate = useNavigate();
  const [showExpired, setShowExpired] = useState(false);
  const loading = useAppSelector((state) => state.cancellations.loading);

  const handleEdit = useCallback(
    (id: string) => navigate(`/kanselleringer/${id}`),
    [navigate],
  );

  const cancellationsToShow = useMemo(() => {
    const filtered = showExpired
      ? cancellations
      : cancellations.filter(
          (c) =>
            c.estimatedVehicleJourney.expiresAtEpochMs > Date.now() + 600000,
        );
    return [...filtered].sort(sortCancellationByExpiry);
  }, [showExpired, cancellations]);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Kanselleringer</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => navigate('/kanselleringer/ny')}
        >
          Ny kansellering
        </Button>
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
          />
        }
        label="Vis utløpte kanselleringer"
        sx={{ mb: 2 }}
      />

      <Loading isLoading={loading} text="Laster kanselleringer...">
        <>
          {cancellationsToShow.length === 0 ? (
            <EmptyState message="Ingen kanselleringer funnet" />
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
                    <TableCell>Dato</TableCell>
                    <TableCell>Kansellert</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cancellationsToShow.map(
                    ({ id, estimatedVehicleJourney: item }) => {
                      const active = isJourneyActive(item.expiresAtEpochMs);
                      return (
                        <TableRow
                          key={item.recordedAtTime}
                          hover
                          onClick={() => active && handleEdit(id)}
                          sx={{
                            cursor: active ? 'pointer' : 'default',
                            opacity: active ? 1 : 0.6,
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={active ? 'Aktiv' : 'Inaktiv'}
                              color={active ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {lines?.find((l: any) => l.id === item.lineRef)
                              ?.publicCode ?? ''}{' '}
                            ({item.lineRef})
                          </TableCell>
                          <TableCell>
                            {
                              item.framedVehicleJourneyRef
                                .datedVehicleJourneyRef
                            }
                          </TableCell>
                          <TableCell>
                            {item.estimatedCalls.estimatedCall[0].stopPointName}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              Date.parse(
                                item.estimatedCalls.estimatedCall[0]
                                  .aimedDepartureTime,
                              ),
                            ).toLocaleTimeString(navigator.language, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            {item.framedVehicleJourneyRef.dataFrameRef}
                          </TableCell>
                          <TableCell>{getCancellationLabel(item)}</TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </Loading>
    </Box>
  );
};

export default Overview;
