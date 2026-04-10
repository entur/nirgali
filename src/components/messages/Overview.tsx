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
import { sortBySituationNumber } from '../../util/sort';
import { isMessageExpired, formatDate } from '../../util/formatters';
import { getMessageType } from './messageHelpers';
import { Message } from '../../reducers/messagesSlice';
import { useAppSelector } from '../../store/hooks';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';

interface OverviewProps {
  messages: Message[];
}

const StatusChip = ({ message, now }: { message: Message; now: number }) => {
  const expired = isMessageExpired(
    message.validityPeriod.endTime,
    message.progress,
    now,
  );
  return (
    <Chip
      label={expired ? 'Inaktiv' : 'Aktiv'}
      color={expired ? 'error' : 'success'}
      size="small"
    />
  );
};

const Overview = ({ messages }: OverviewProps) => {
  const now = useMemo(() => Date.now(), []);
  const [showExpiredMessages, setShowExpiredMessages] = useState(false);
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.messages.loading);

  const handleEdit = useCallback(
    (id: string) => navigate(`/meldinger/${id}`),
    [navigate],
  );

  const messagesToRender = useMemo(() => {
    const filtered = showExpiredMessages
      ? messages
      : messages.filter(
          (message) =>
            !message.validityPeriod.endTime ||
            Date.parse(message.validityPeriod.endTime) > now,
        );
    return [...filtered].sort(sortBySituationNumber);
  }, [messages, showExpiredMessages, now]);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Avviksmeldinger</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => navigate('/meldinger/ny')}
        >
          Ny melding
        </Button>
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={showExpiredMessages}
            onChange={(e) => setShowExpiredMessages(e.target.checked)}
          />
        }
        label="Vis utløpte meldinger"
        sx={{ mb: 2 }}
      />

      <Loading isLoading={loading} text="Laster meldinger...">
        <>
          {messagesToRender.length === 0 ? (
            <EmptyState message="Ingen meldinger funnet" />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>Oppsummering</TableCell>
                    <TableCell>Avvikstype</TableCell>
                    <TableCell>Fra dato</TableCell>
                    <TableCell>Til dato</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messagesToRender.map(({ id, ...item }) => (
                    <TableRow
                      key={item.situationNumber}
                      hover
                      onClick={() => handleEdit(id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <StatusChip message={{ id, ...item }} now={now} />
                      </TableCell>
                      <TableCell>
                        {item.situationNumber.split(':').pop()}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        {item.summary.text}
                      </TableCell>
                      <TableCell>{item.reportType}</TableCell>
                      <TableCell>
                        {formatDate(item.validityPeriod.startTime)}
                      </TableCell>
                      <TableCell>
                        {formatDate(item.validityPeriod.endTime)}
                      </TableCell>
                      <TableCell>{getMessageType(item.affects)}</TableCell>
                    </TableRow>
                  ))}
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
