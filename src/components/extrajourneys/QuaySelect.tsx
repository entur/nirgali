import { useState, useCallback, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { GeocodedStopPlace, Quay } from './types';

interface QuayOption {
  label: string;
  value: Quay;
}

interface QuaySelectProps {
  selectedStopPlace?: GeocodedStopPlace;
  value?: Quay;
  onChange: (value?: Quay) => void;
  validationResult?: { feedback: string; variant: string };
}

export function QuaySelect({
  selectedStopPlace,
  value,
  onChange,
  validationResult,
}: QuaySelectProps) {
  const [options, setOptions] = useState<QuayOption[]>([]);

  const fetchQuays = useCallback(async () => {
    if (!selectedStopPlace) {
      setOptions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.entur.io/stop-places/v1/read/stop-places/${selectedStopPlace.properties.id}`,
      );
      const data = await response.json();
      setOptions(
        data.quays.quayRefOrQuay.map((quay: Quay) => ({
          value: quay,
          label: `${quay.id} (${quay.publicCode || 'Ukjent'})`,
        })),
      );
    } catch {
      setOptions([]);
    }
  }, [selectedStopPlace]);

  useEffect(() => {
    fetchQuays();
  }, [fetchQuays]);

  return (
    <Autocomplete
      fullWidth
      sx={{ minWidth: 250 }}
      options={options}
      getOptionLabel={(option) => option.label}
      value={
        value
          ? { value, label: `${value.id} (${value.publicCode || 'Ukjent'})` }
          : null
      }
      onChange={(_, newValue) => onChange(newValue?.value)}
      isOptionEqualToValue={(option, val) => option.value.id === val.value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Platform"
          size="small"
          error={validationResult?.variant === 'error'}
          helperText={validationResult?.feedback}
        />
      )}
    />
  );
}
