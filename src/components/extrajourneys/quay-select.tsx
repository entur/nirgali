import { useCallback } from 'react';
import { TypedDropDown } from './TypedDropdown';
import { GeocodedStopPlace, Quay } from './types';
import { ValidationFeedback } from './validate';

export function QuaySelect(props: {
  selectedStopPlace?: GeocodedStopPlace;
  value?: Quay;
  onChange: (value?: Quay) => void;
  validationResult?: ValidationFeedback;
}) {
  const fetchItems = useCallback(
    async (_: any, abortControllerRef: { current: { signal: any } }) => {
      try {
        if (!props.selectedStopPlace) {
          return [];
        }

        const response = await fetch(
          `https://api.entur.io/stop-places/v1/read/stop-places/${props.selectedStopPlace.properties.id}`,
          { signal: abortControllerRef.current.signal },
        );
        const data = await response.json();
        return data.quays.quayRefOrQuay.map((quay: Quay) => ({
          value: quay,
          label: `${quay.id} (${quay.publicCode ? quay.publicCode : 'Ukjent'})`,
        }));
      } catch (error) {
        // @ts-ignore
        if (error && error.name === 'AbortError') throw error;
        return [];
      }
    },
    [props.selectedStopPlace],
  );

  return (
    <TypedDropDown
      {...props.validationResult}
      label="Platform"
      items={fetchItems}
      selectedItem={
        props.value
          ? {
              value: props.value,
              label: `${props.value.id} (${props.value.publicCode})`,
            }
          : null
      }
      onChange={props.onChange}
    />
  );
}
