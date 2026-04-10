import { useState, useCallback, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { GeocodedStopPlace, VehicleMode } from './types';

const vehicleModeMap: Record<VehicleMode, string[]> = {
  [VehicleMode.bus]: ['onstreetBus', 'busStation', 'coachStation'],
  [VehicleMode.coach]: ['onstreetBus', 'busStation', 'coachStation'],
  [VehicleMode.ferry]: ['harbourPort', 'ferryPort', 'ferryStop'],
  [VehicleMode.tram]: ['onstreetTram', 'tramStation'],
  [VehicleMode.rail]: ['railStation'],
  [VehicleMode.metro]: ['metroStation'],
};

interface StopPlaceAutocompleteProps {
  mode?: VehicleMode;
  value?: GeocodedStopPlace;
  onChange: (newValue?: GeocodedStopPlace) => void;
}

interface StopPlaceOption {
  label: string;
  value: GeocodedStopPlace;
}

export function StopPlaceAutocomplete({
  mode,
  value,
  onChange,
}: StopPlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<StopPlaceOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(
    async (input: string) => {
      if (!input) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        let url = `https://api.entur.io/geocoder/v1/autocomplete?text=${input}&size=5&layers=venue&multiModal=child`;
        if (mode) {
          url = `${url}&categories=${vehicleModeMap[mode].join(',')}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setOptions(
          data.features.map((item: GeocodedStopPlace) => ({
            label: item.properties.name,
            value: item,
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [mode],
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchOptions(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchOptions]);

  return (
    <Autocomplete
      fullWidth
      sx={{ minWidth: 250 }}
      options={options}
      getOptionLabel={(option) => option.label}
      loading={loading}
      value={value ? { label: value.properties.name, value } : null}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onChange={(_, newValue) => onChange(newValue?.value)}
      isOptionEqualToValue={(option, val) =>
        option.value.properties.id === val.value.properties.id
      }
      renderInput={(params) => (
        <TextField {...params} label="Stoppested" size="small" />
      )}
    />
  );
}
