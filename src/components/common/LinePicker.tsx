import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';

interface LineOption {
  label: string;
  value: string;
}

interface Line {
  id: string;
  name: string;
  publicCode: string;
  quays?: any[];
}

interface LinePickerProps {
  lines: Line[];
  onChange: (option: LineOption | null) => void;
}

const LinePicker = ({ lines, onChange }: LinePickerProps) => {
  const options = useMemo(
    () =>
      [...lines]
        .sort((a, b) => {
          if (a.publicCode > b.publicCode) return 1;
          if (b.publicCode > a.publicCode) return -1;
          return 0;
        })
        .map((item) => ({
          label: `${item.publicCode} ${item.name} (${item.id})`,
          value: item.id,
        })),
    [lines],
  );

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Velg linje" size="small" />
      )}
    />
  );
};

export default LinePicker;
