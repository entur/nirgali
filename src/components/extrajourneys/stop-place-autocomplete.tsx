import { useCallback, useState } from 'react';
import { SearchableDropdown } from '@entur/dropdown';
import { VehicleMode } from './types';

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
  value?: any;
  onChange: (newValue: any) => void;
}) {
  // Husk å bruke useCallback for å unngå at funksjonen kjøres oftere enn nødvendig
  const fetchItems = useCallback(
    async (
      inputValue: any,
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
        return data.features.map((item: any) => {
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
    <SearchableDropdown
      label="Stoppested"
      items={fetchItems}
      selectedItem={value}
      onChange={onChange}
    />
  );
}
