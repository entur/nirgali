import { useMemo, useEffect, useRef, useState } from 'react';
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

interface ApiClient {
  getStopPlaces: (ids: string[]) => Promise<any[]>;
  getTopographicPlaces: (ids: string[]) => Promise<any[]>;
}

const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

const useTopographicPlaces = (stops: Stop[], api: ApiClient) => {
  const stopPlaceTopographicPlaceIndex = useRef<Record<string, string>>({});
  const [stopPlaces, setStopPlaces] = useState<Record<string, any>>({});
  const [topographicPlaces, setTopographicPlaces] = useState<
    Record<string, any>
  >({});

  useEffect(() => {
    const populateTopographicPlaces = async (stopPlaceIds: string[]) => {
      const stopPlacesData = await Promise.all(
        chunk(stopPlaceIds, 200).map(async (c) => await api.getStopPlaces(c)),
      );

      setStopPlaces((prev) =>
        stopPlacesData.flat().reduce(
          (acc, stopPlace) => {
            acc[stopPlace.id] = stopPlace;
            return acc;
          },
          { ...prev },
        ),
      );

      const topographicPlaceIds = stopPlacesData.flat().map((stopPlace) => {
        stopPlaceTopographicPlaceIndex.current[stopPlace.id] =
          stopPlace.topographicPlaceRef.ref;
        return stopPlace.topographicPlaceRef.ref;
      });

      const topographicPlacesData = await Promise.all(
        chunk(topographicPlaceIds, 200).map(
          async (c) => await api.getTopographicPlaces(c),
        ),
      );

      setTopographicPlaces((prev) =>
        topographicPlacesData.flat().reduce(
          (acc, topographicPlace) => {
            acc[topographicPlace.id] = topographicPlace;
            return acc;
          },
          { ...prev },
        ),
      );
    };

    populateTopographicPlaces(
      stops.filter((stop) => stop.stopPlace).map((stop) => stop.stopPlace!.id),
    );
  }, [stops, api]);

  return {
    stopPlaceTopographicPlaceIndex: stopPlaceTopographicPlaceIndex.current,
    topographicPlaces,
    stopPlaces,
  };
};

const useOptions = (stops: Stop[], api: ApiClient, sort = false) => {
  const { stopPlaceTopographicPlaceIndex, topographicPlaces, stopPlaces } =
    useTopographicPlaces(stops, api);

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
        const topographicPlace =
          topographicPlaces[stopPlaceTopographicPlaceIndex[item.stopPlace!.id]];
        const stopPlace = stopPlaces[item.stopPlace!.id];
        return {
          label:
            item.name +
            ' - ' +
            item.stopPlace!.id +
            (topographicPlace
              ? ' (' + topographicPlace.descriptor.name.value + ')'
              : '') +
            (stopPlace ? ' - ' + stopPlace.transportMode : ''),
          value: item.stopPlace!.id,
        };
      });

    return sort
      ? stopOptions.sort((a, b) => a.label.localeCompare(b.label))
      : stopOptions;
  }, [
    stops,
    stopPlaceTopographicPlaceIndex,
    topographicPlaces,
    stopPlaces,
    sort,
  ]);

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
