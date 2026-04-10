import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import { useOperators, Operator } from '../../hooks/useOperators';
import { useLinesForAuthority } from '../../hooks/useLinesForAuthority';
import { Call, Line, VehicleMode } from './types';
import { RegisterEstimatedCallRow } from './RegisterEstimatedCallRow';
import { mapExtraJourney } from './mapExtraJourney';
import {
  CallValidationResult,
  ValidationFeedback,
  useExtrajourneyValidation,
} from './validate';
import api from '../../api/api';
import { useConfig } from '../../config/ConfigContext';
import { useAuth } from 'react-oidc-context';
import Page from '../common/Page';
import OverlayLoader from '../common/OverlayLoader';
import { useAppDispatch } from '../../store/hooks';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../reducers/notificationSlice';

interface RegisterProps {
  selectedOrganization: string;
}

export const Register = ({ selectedOrganization }: RegisterProps) => {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const operators = useOperators(selectedOrganization);
  const [name, setName] = useState<string | undefined>();
  const [selectedMode, setSelectedMode] = useState<VehicleMode | undefined>();
  const [destinationDisplay, setDestinationDisplay] = useState<
    string | undefined
  >();
  const [selectedOperator, setSelectedOperator] = useState<
    Operator | undefined
  >();
  const [selectedLine, setSelectedLine] = useState<Line | undefined>();
  const allLines = useLinesForAuthority(selectedOrganization);
  const visibleLines = selectedOperator
    ? allLines.filter((line) => line.operator?.id === selectedOperator.id)
    : allLines;

  useEffect(() => {
    if (!selectedOperator && operators.length === 1) {
      setSelectedOperator(operators[0]);
    }
  }, [operators, selectedOperator]);

  useEffect(() => {
    if (!selectedLine && visibleLines.length === 1) {
      setSelectedLine(visibleLines[0]);
      if (visibleLines[0].operator && !selectedOperator) {
        setSelectedOperator({
          id: visibleLines[0].operator.id,
          name: visibleLines[0].operator.name,
        });
      }
    }
  }, [visibleLines, selectedLine, selectedOperator]);

  const [calls, setCalls] = useState<Call[]>([
    { boarding: true, alighting: false },
    { boarding: false, alighting: true },
  ]);

  const navigate = useNavigate();

  const { result, validate } = useExtrajourneyValidation({
    name,
    mode: selectedMode,
    destinationDisplay,
    operator: selectedOperator,
    line: selectedLine,
    calls,
  });

  const config = useConfig();
  const auth = useAuth();
  const { createOrUpdateExtrajourney } = api(config, auth);
  const codespace = selectedOrganization.split(':')[0];

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const extraJourney = mapExtraJourney({
        codespace,
        selectedMode,
        name,
        destinationDisplay,
        selectedOperator,
        selectedLine,
        calls,
      });
      await createOrUpdateExtrajourney(
        codespace,
        selectedOrganization,
        extraJourney,
      );
      dispatch(
        showSuccessNotification(
          'Ekstraavgang opprettet',
          'Ekstraavgangen ble lagret',
        ),
      );
      navigate('/ekstraavganger');
    } catch {
      dispatch(
        showErrorNotification('Feil', 'Kunne ikke opprette ekstraavgang'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page backButtonTitle="Oversikt" title="Registrer ny ekstraavgang">
      <OverlayLoader isLoading={saving} text="Lagrer ekstraavgang...">
        <>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Turdetaljer
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Navn"
              value={name ?? ''}
              onChange={(e) => setName(e.target.value)}
              error={
                (result.name as ValidationFeedback | undefined)?.variant ===
                'error'
              }
              helperText={
                (result.name as ValidationFeedback | undefined)?.feedback
              }
              sx={{ mb: 2 }}
            />

            <FormControl
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              error={
                (result.mode as ValidationFeedback | undefined)?.variant ===
                'error'
              }
            >
              <InputLabel>Mode</InputLabel>
              <Select
                value={selectedMode ?? ''}
                label="Mode"
                onChange={(e) => setSelectedMode(e.target.value as VehicleMode)}
              >
                {Object.values(VehicleMode).map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </Select>
              {(result.mode as ValidationFeedback | undefined)?.feedback && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {(result.mode as ValidationFeedback).feedback}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Destinasjon"
              value={destinationDisplay ?? ''}
              onChange={(e) => setDestinationDisplay(e.target.value)}
              error={
                (result.destinationDisplay as ValidationFeedback | undefined)
                  ?.variant === 'error'
              }
              helperText={
                (result.destinationDisplay as ValidationFeedback | undefined)
                  ?.feedback
              }
              sx={{ mb: 2 }}
            />

            <Autocomplete
              options={operators}
              getOptionLabel={(op) => `${op.name} (${op.id})`}
              value={selectedOperator ?? null}
              onChange={(_, newValue) => {
                setSelectedOperator(newValue ?? undefined);
                if (
                  !newValue ||
                  (selectedLine && selectedLine.operator?.id !== newValue.id)
                ) {
                  setSelectedLine(undefined);
                }
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Operator"
                  size="small"
                  error={
                    (result.operator as ValidationFeedback | undefined)
                      ?.variant === 'error'
                  }
                  helperText={
                    (result.operator as ValidationFeedback | undefined)
                      ?.feedback
                  }
                />
              )}
              sx={{ mb: 2 }}
            />

            <Autocomplete
              options={visibleLines}
              getOptionLabel={(line) =>
                `${line.publicCode} ${line.name} (${line.id})`
              }
              value={selectedLine ?? null}
              onChange={(_, newValue) => {
                setSelectedLine(newValue ?? undefined);
                if (newValue?.operator) {
                  setSelectedOperator({
                    id: newValue.operator.id,
                    name: newValue.operator.name,
                  });
                }
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Linje"
                  size="small"
                  error={
                    (result.line as ValidationFeedback | undefined)?.variant ===
                    'error'
                  }
                  helperText={
                    (result.line as ValidationFeedback | undefined)?.feedback
                  }
                />
              )}
              sx={{ mb: 2 }}
            />
          </Paper>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stoppested</TableCell>
                  <TableCell>Tider og av-/påstigning</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call, i) => (
                  <RegisterEstimatedCallRow
                    key={i}
                    validationResult={
                      result.calls
                        ? (result.calls as CallValidationResult[])[i]
                        : undefined
                    }
                    call={call}
                    isFirst={i === 0}
                    isLast={i === calls.length - 1}
                    onChange={(updatedCall: Call) => {
                      setCalls([
                        ...calls.slice(0, i),
                        updatedCall,
                        ...calls.slice(i + 1),
                      ]);
                    }}
                    onAdd={() =>
                      setCalls([
                        ...calls.slice(0, i + 1),
                        { boarding: true, alighting: true },
                        ...calls.slice(i + 1),
                      ])
                    }
                    mode={selectedMode}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button variant="contained" color="success" onClick={submit}>
            Opprett ekstraavgang
          </Button>
        </>
      </OverlayLoader>
    </Page>
  );
};
