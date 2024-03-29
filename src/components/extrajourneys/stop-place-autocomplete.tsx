import { useCallback } from 'react';
import { GeocodedStopPlace, VehicleMode } from './types';
import { TypedSearchableDropdown } from './TypedDropdown';

const vehicleModeMap = {
  [VehicleMode.bus]: ['onstreetBus', 'busStation', 'coachStation'],
  [VehicleMode.coach]: ['onstreetBus', 'busStation', 'coachStation'],
  [VehicleMode.ferry]: ['harbourPort', 'ferryPort', 'ferryStop'],
  [VehicleMode.tram]: ['onstreetTram', 'tramStation'],
  [VehicleMode.rail]: ['railStation'],
  [VehicleMode.metro]: ['metroStation'],
};

export function StopPlaceAutocomplete({
  mode,
  value,
  onChange,
}: {
  mode?: VehicleMode;
  value?: GeocodedStopPlace;
  onChange: (newValue?: GeocodedStopPlace) => void;
}) {
  const fetchItems = useCallback(
    async (
      inputValue: string,
      abortControllerRef: { current: { signal: any } },
    ) => {
      if (!inputValue) {
        return [];
      }

      try {
        let url = `https://api.entur.io/geocoder/v1/autocomplete?text=${inputValue}&size=5&layers=venue&multiModal=child`;

        if (mode) {
          url = `${url}&categories=${vehicleModeMap[mode].join(',')}`;
        }

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });
        const data = await response.json();
        return data.features.map((item: GeocodedStopPlace) => {
          return { label: item.properties.name, value: item };
        });
      } catch (error) {
        // @ts-ignore
        if (error && error.name === 'AbortError') throw error;
        return [];
      }
    },
    [mode],
  );

  return (
    <TypedSearchableDropdown
      label="Stoppested"
      items={fetchItems}
      selectedItem={value ? { label: value.properties.name, value } : null}
      onChange={onChange}
    />
  );
}
