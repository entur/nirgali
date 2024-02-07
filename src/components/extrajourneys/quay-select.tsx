import { useCallback } from 'react';
import { Dropdown } from '@entur/dropdown';

export function QuaySelect(props: {
  selectedStopPlace: any;
  value: any;
  onChange: (value: any) => void;
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
        console.log(data);
        return data.quays.quayRefOrQuay.map(
          (quay: { id: string; publicCode: string }) => ({
            value: quay.id,
            label: `${quay.id} (${quay.publicCode})`,
          }),
        );
      } catch (error) {

        // @ts-ignore
        if (error && error.name === 'AbortError') throw error;
        return [];
      }
    },
    [props.selectedStopPlace],
  );

  return (
    <Dropdown
      label="Platform"
      items={fetchItems}
      selectedItem={props.value}
      onChange={props.onChange}
    />
  );
}
