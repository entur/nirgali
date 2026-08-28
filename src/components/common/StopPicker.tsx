import { useMemo, useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface StopOption {
  label: string;
  value: string;
}

interface Stop {
  id: string;
  name: string;
  stopPlace?: {
    id: string;
  };
}

interface StopPlaceSummary {
  id: string;
  transportMode?: string | null;
  topographicPlaceName?: string | null;
}

interface ApiClient {
  getStopPlaceSummaries: (ids: string[]) => Promise<StopPlaceSummary[]>;
}

const useStopPlaceSummaries = (stops: Stop[], api: ApiClient) => {
  const [summaries, setSummaries] = useState<Record<string, StopPlaceSummary>>(
    {},
  );

  // Keyed on the joined id string rather than the array, so a new array with the
  // same contents does not retrigger the fetch. Stop place ids are deduplicated
  // here as well as on the backend.
  const idsKey = useMemo(
    () =>
      [
        ...new Set(
          stops
            .filter((stop) => stop.stopPlace)
            .map((stop) => stop.stopPlace!.id),
        ),
      ].join(','),
    [stops],
  );

  useEffect(() => {
    if (!idsKey) {
      return;
    }
    let cancelled = false;

    api.getStopPlaceSummaries(idsKey.split(',')).then((data) => {
      if (cancelled) {
        return;
      }
      setSummaries((prev) =>
        data.reduce(
          (acc, summary) => {
            acc[summary.id] = summary;
            return acc;
          },
          { ...prev },
        ),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [idsKey, api]);

  return summaries;
};

const useOptions = (stops: Stop[], api: ApiClient, sort = false) => {
  const summaries = useStopPlaceSummaries(stops, api);

  const options = useMemo(() => {
    const stopOptions = stops
      .filter(
        (item, i, list) =>
          i ===
          list.findIndex(
            (j) =>
              j.stopPlace &&
              item.stopPlace &&
              j.stopPlace.id === item.stopPlace.id,
          ),
      )
      .map((item) => {
        const summary = summaries[item.stopPlace!.id];
        return {
          label:
            item.name +
            ' - ' +
            item.stopPlace!.id +
            (summary?.topographicPlaceName
              ? ' (' + summary.topographicPlaceName + ')'
              : '') +
            (summary?.transportMode ? ' - ' + summary.transportMode : ''),
          value: item.stopPlace!.id,
        };
      });

    return sort
      ? stopOptions.sort((a, b) => a.label.localeCompare(b.label))
      : stopOptions;
  }, [stops, summaries, sort]);

  return options;
};

interface StopPickerProps {
  stops: Stop[];
  isMulti?: boolean;
  onChange: (options: StopOption[] | StopOption | null) => void;
  api: ApiClient;
  sort?: boolean;
}

const StopPicker = ({
  stops,
  isMulti,
  onChange,
  api,
  sort,
}: StopPickerProps) => {
  const options = useOptions(stops, api, sort);

  if (isMulti) {
    return (
      <Autocomplete
        multiple
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        onChange={(_, newValue) => onChange(newValue)}
        renderInput={(params) => (
          <TextField {...params} label="Velg stopp" size="small" />
        )}
      />
    );
  }

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Velg stopp" size="small" />
      )}
    />
  );
};

export default StopPicker;
