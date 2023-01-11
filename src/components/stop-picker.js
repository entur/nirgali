import React, { useMemo, useEffect, useRef, useState } from 'react';
import Select from 'react-windowed-select';

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const useTopographicPlaces = (stops, api) => {
  const stopPlaceTopographicPlaceIndex = useRef({});
  const [stopPlaces, setStopPlaces] = useState({});
  const [topographicPlaces, setTopographicPlaces] = useState({});

  useEffect(() => {
    const populateTopographicPlaces = async (stopPlaceIds) => {
      const stopPlaces = await Promise.all(
        chunk(stopPlaceIds, 200).map(
          async (chunk) => await api.getStopPlaces(chunk)
        )
      );

      setStopPlaces((prev) =>
        stopPlaces.flat().reduce((acc, stopPlace) => {
          acc[stopPlace.id] = stopPlace;
          return acc;
        }, prev)
      );

      const topographicPlaceIds = stopPlaces.flat().map((stopPlace) => {
        stopPlaceTopographicPlaceIndex.current[stopPlace.id] =
          stopPlace.topographicPlaceRef.ref;
        return stopPlace.topographicPlaceRef.ref;
      });

      const topographicPlacesData = await Promise.all(
        chunk(topographicPlaceIds, 200).map(
          async (chunk) => await api.getTopographicPlaces(chunk)
        )
      );

      setTopographicPlaces((prev) =>
        topographicPlacesData.flat().reduce((acc, topographicPlace) => {
          acc[topographicPlace.id] = topographicPlace;
          return acc;
        }, Object.assign({}, prev))
      );
    };

    populateTopographicPlaces(stops.filter(stop => stop.stopPlace).map((stop) => stop.stopPlace.id));
  }, [stops, api]);

  return {
    stopPlaceTopographicPlaceIndex: stopPlaceTopographicPlaceIndex.current,
    topographicPlaces,
    stopPlaces,
  };
};

const useOptions = (stops, api, sort = false) => {
  const { stopPlaceTopographicPlaceIndex, topographicPlaces, stopPlaces } =
    useTopographicPlaces(stops, api);

  const options = useMemo(() => {
    const stopOptins = stops
      .filter(
        (item, i, list) =>
          i ===
          list.findIndex(
            (j) =>
              j.stopPlace &&
              item.stopPlace &&
              j.stopPlace.id === item.stopPlace.id
          )
      )
      .map((item) => {
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
          value: item.stopPlace.id,
        };
      });

    return sort
      ? stopOptins.sort((a, b) => a.label.localeCompare(b.label))
      : stopOptins;
  }, [
    stops,
    stopPlaceTopographicPlaceIndex,
    topographicPlaces,
    stopPlaces,
    sort,
  ]);
  return options;
};

const StopPicker = ({ stops, isMulti, onChange, api, sort }) => {
  const options = useOptions(stops, api, sort);

  return (
    <Select
      isMulti={isMulti}
      placeholder="Velg stopp"
      onChange={onChange}
      options={options}
    />
  );
};

export default StopPicker;
