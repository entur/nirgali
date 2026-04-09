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
import { getLocalTimeZone, now } from '@internationalized/date';
import { sortCancellationByExpiry } from '../../util/sort';

interface OverviewProps {
  cancellations: any[];
  lines: any[];
}

const StatusChip = ({ item }: { item: any }) => {
  const isActive =
    item.expiresAtEpochMs >
    now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime();
  return (
    <Chip
      label={isActive ? 'Aktiv' : 'Inaktiv'}
      color={isActive ? 'success' : 'error'}
      size="small"
    />
  );
};

const getCancellationLabel = (item: any): string => {
  if (item.cancellation) return 'Ja';
  if (item.estimatedCalls.estimatedCall.some((call: any) => call.cancellation))
    return 'Delvis';
  return 'Nei';
};

const Overview = ({ cancellations, lines }: OverviewProps) => {
  const navigate = useNavigate();
  const [showExpired, setShowExpired] = useState(false);

  const handleNew = useCallback(
    () => navigate('/kanselleringer/ny'),
    [navigate],
  );

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
    return filtered.sort(sortCancellationByExpiry);
  }, [showExpired, cancellations]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Oversikt
      </Typography>

      <Button variant="outlined" fullWidth onClick={handleNew} sx={{ mb: 2 }}>
        Ny kansellering
      </Button>

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
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {cancellationsToShow.map(
              ({ id, estimatedVehicleJourney: item }) => (
                <TableRow key={item.recordedAtTime} hover>
                  <TableCell>
                    <StatusChip item={item} />
                  </TableCell>
                  <TableCell>
                    {lines?.find((l: any) => l.id === item.lineRef)
                      ?.publicCode ?? ''}{' '}
                    ({item.lineRef})
                  </TableCell>
                  <TableCell>
                    {item.framedVehicleJourneyRef.datedVehicleJourneyRef}
                  </TableCell>
                  <TableCell>
                    {item.estimatedCalls.estimatedCall[0].stopPointName}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      Date.parse(
                        item.estimatedCalls.estimatedCall[0].aimedDepartureTime,
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
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(id)}
                      disabled={
                        item.expiresAtEpochMs <=
                        now(getLocalTimeZone())
                          .add({ minutes: 10 })
                          .toDate()
                          .getTime()
                      }
                    >
                      Endre
                    </Button>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Overview;
