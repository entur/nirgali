import React, { useMemo, useEffect, useRef, useState } from 'react';
import Select from 'react-windowed-select';

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const headers = {
  'Et-Client-Name': 'entur-nirgali'
};

const getStopPlaces = async ids => {
  const response = await fetch(
    `https://api.dev.entur.io/stop-places/v1/read/stop-places?ids=${ids}`,
    { headers }
  );
  const stopPlaces = await response.json();
  return stopPlaces;
};

const getTopographicPlaces = async ids => {
  const response = await fetch(
    `https://api.dev.entur.io/stop-places/v1/read/topographic-places?ids=${ids}`,
    { headers }
  );
  const topographicPlaces = await response.json();
  return topographicPlaces;
};

const useTopographicPlaces = stops => {
  const stopPlaceTopographicPlaceIndex = useRef({});
  const [stopPlaces, setStopPlaces] = useState({});
  const [topographicPlaces, setTopographicPlaces] = useState({});

  useEffect(() => {
    const populateTopographicPlaces = async stopPlaceIds => {
      const stopPlaces = await Promise.all(
        chunk(stopPlaceIds, 200).map(async chunk => await getStopPlaces(chunk))
      );

      setStopPlaces(prev =>
        stopPlaces.flat().reduce((acc, stopPlace) => {
          acc[stopPlace.id] = stopPlace;
          return acc;
        }, prev)
      );

      const topographicPlaceIds = stopPlaces.flat().map(stopPlace => {
        stopPlaceTopographicPlaceIndex.current[stopPlace.id] =
          stopPlace.topographicPlaceRef.ref;
        return stopPlace.topographicPlaceRef.ref;
      });

      const topographicPlacesData = await await Promise.all(
        chunk(topographicPlaceIds, 200).map(
          async chunk => await getTopographicPlaces(chunk)
        )
      );

      setTopographicPlaces(prev =>
        topographicPlacesData.flat().reduce((acc, topographicPlace) => {
          acc[topographicPlace.id] = topographicPlace;
          return acc;
        }, Object.assign({}, prev))
      );
    };

    populateTopographicPlaces(stops.map(stop => stop.stopPlace.id));
  }, [stops]);

  return {
    stopPlaceTopographicPlaceIndex: stopPlaceTopographicPlaceIndex.current,
    topographicPlaces,
    stopPlaces
  };
};

const useOptions = stops => {
  const {
    stopPlaceTopographicPlaceIndex,
    topographicPlaces,
    stopPlaces
  } = useTopographicPlaces(stops);

  const options = useMemo(() => {
    return stops
      .filter(
        (item, i, list) =>
          i ===
          list.findIndex(
            j =>
              j.stopPlace &&
              item.stopPlace &&
              j.stopPlace.id === item.stopPlace.id
          )
      )
      .sort((a, b) => {
        if (a.name > b.name) return 1;
        if (b.name > a.name) return -1;
        return 0;
      })
      .map(item => {
        const topographicPlace =
          topographicPlaces[stopPlaceTopographicPlaceIndex[item.stopPlace.id]];
        const stopPlace = stopPlaces[item.stopPlace.id];
        return {
          label:
            item.name +
            ' - ' +
            item.stopPlace.id +
            (topographicPlace
              ? ' (' + topographicPlace.descriptor.name.value + ')'
              : '') +
            (stopPlace ? ' - ' + stopPlace.transportMode : ''),
          value: item.stopPlace.id
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [stops, stopPlaceTopographicPlaceIndex, topographicPlaces, stopPlaces]);
  return options;
};

export default ({ stops, isMulti, onChange }) => {
  const options = useOptions(stops);

  return (
    <Select
      isMulti={isMulti}
      placeholder="Velg stopp"
      onChange={onChange}
      options={options}
    />
  );
};
