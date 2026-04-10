import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Quay } from './types';

interface QuayOption {
  label: string;
  value: Quay;
}

interface QuayEditSelectProps {
  currentQuayId: string;
  onChange: (quay: Quay) => void;
  disabled?: boolean;
}

export function QuayEditSelect({
  currentQuayId,
  onChange,
  disabled,
}: QuayEditSelectProps) {
  const [options, setOptions] = useState<QuayOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<QuayOption | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSiblingQuays = async () => {
      if (!currentQuayId) return;
      setLoading(true);
      try {
        // Use the journey planner GraphQL API to find the parent stop place
        // and its quays from a quay ID
        const query = `{
          quay(id: "${currentQuayId}") {
            id
            publicCode
            stopPlace {
              id
              quays {
                id
                publicCode
              }
            }
          }
        }`;

        const response = await fetch(
          'https://api.entur.io/journey-planner/v3/graphql',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ET-Client-Name': 'entur - deviation-messages',
            },
            body: JSON.stringify({ query }),
          },
        );
        const data = await response.json();
        const siblingQuays: Quay[] =
          data.data?.quay?.stopPlace?.quays ?? [];

        const quayOptions: QuayOption[] = siblingQuays.map((quay) => ({
          value: quay,
          label: `${quay.id} (${quay.publicCode || 'Ukjent'})`,
        }));

        setOptions(quayOptions);
        setSelectedOption(
          quayOptions.find((q) => q.value.id === currentQuayId) ?? null,
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSiblingQuays();
  }, [currentQuayId]);

  return (
    <Autocomplete
      fullWidth
      sx={{ minWidth: 200, mt: 0.5 }}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.label}
      value={selectedOption}
      onChange={(_, newValue) => {
        setSelectedOption(newValue);
        if (newValue) onChange(newValue.value);
      }}
      isOptionEqualToValue={(option, val) => option.value.id === val.value.id}
      disabled={disabled}
      renderInput={(params) => (
        <TextField {...params} label="Platform" size="small" />
      )}
    />
  );
}
