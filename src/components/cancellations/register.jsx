import React, { useMemo, useCallback } from 'react';
import Select from 'react-select';
import {
  ButtonGroup,
  PrimaryButton as Button,
  SecondaryButton,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import { DatePicker } from '@entur/datepicker';
import LinePicker from '../common/line-picker';
import { useNavigate } from 'react-router-dom';
import { sortServiceJourneyByDepartureTime } from '../../util/sort';
import StopPicker from '../common/stop-picker';
import { mapEstimatedCall } from './mapEstimatedCall';
import {
  getLocalTimeZone,
  now,
  toCalendarDate,
  today,
} from '@internationalized/date';

export const Register = ({ lines, api, organization, refetch }) => {
  const navigate = useNavigate();
  const [chosenLine, setChosenLine] = React.useState(null);
  const [departureDate, setDepartureDate] = React.useState(
    now(getLocalTimeZone()),
  );
  const [departures, setDepartures] = React.useState([]);
  const [chosenDeparture, setChosenDeparture] = React.useState(null);
  const [isDepartureStops, setIsDepartureStops] = React.useState(false);
  const [departureStops, setDepartureStops] = React.useState([]);

  const handleChangeLine = useCallback(
    (line) => setChosenLine(line.value),
    [setChosenLine],
  );

  const handleDepartureDateChange = useCallback(
    (chosenDate) => setDepartureDate(chosenDate),
    [setDepartureDate],
  );

  const handleChangeDeparture = useCallback(
    (departure) => setChosenDeparture(departure.value),
    [setChosenDeparture],
  );
  const handleSubmit = useCallback(async () => {
    const now = new Date();
    const departureData = departures.find(
      (departure) => departure.id === chosenDeparture,
    );
    const newCancellation = {
      estimatedVehicleJourney: {
        recordedAtTime: now.toISOString(),
        lineRef: chosenLine,
        directionRef: '0',
        framedVehicleJourneyRef: {
          dataFrameRef: toCalendarDate(departureDate).toString(),
          datedVehicleJourneyRef: chosenDeparture,
        },
        cancellation: !isDepartureStops && departureStops.length === 0,
        dataSource: organization.split(':')[0],
        estimatedCalls: {
          estimatedCall: departureData.estimatedCalls.map((estimatedCall) =>
            mapEstimatedCall(estimatedCall, departureData, departureStops),
          ),
        },
        isCompleteStopSequence: true,
        expiresAtEpochMs:
          Date.parse(
            departureData.estimatedCalls[
              departureData.estimatedCalls.length - 1
            ].aimedArrivalTime,
          ) +
          600 * 1000,
      },
    };

    await api.createOrUpdateCancellation(
      organization.split(':')[0],
      organization,
      newCancellation,
    );

    await refetch();

    navigate('/kanselleringer');
  }, [
    api,
    refetch,
    chosenDeparture,
    chosenLine,
    departureDate,
    departureStops,
    departures,
    isDepartureStops,
    navigate,
    organization,
  ]);

  const handleCancel = useCallback(
    () => navigate('/kanselleringer'),
    [navigate],
  );

  const serviceJourneyOptions = useMemo(() => {
    return departures
      .filter(
        (serviceJourney) =>
          Date.parse(
            serviceJourney.estimatedCalls[
              serviceJourney.estimatedCalls.length - 1
            ].aimedArrivalTime,
          ) > now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime(),
      )
      .sort(sortServiceJourneyByDepartureTime)
      .map((item) => ({
        label:
          new Date(
            Date.parse(item.estimatedCalls[0].aimedDepartureTime),
          ).toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          }) +
          ' fra ' +
          item.estimatedCalls[0].quay.name +
          ' (' +
          item.id +
          ')',
        value: item.id,
      }));
  }, [departures]);

  const callApiDeparture = useCallback(() => {
    const fetchServiceJourneys = async () => {
      const response = await api.getDepartures(
        chosenLine,
        toCalendarDate(departureDate).toString(),
      );
      setDepartures(response.data.serviceJourneys);
    };
    if (chosenLine !== null && departureDate !== null) {
      fetchServiceJourneys();
    }
  }, [chosenLine, departureDate, api]);

  const onDepartureStopsChange = useCallback(
    (e) => {
      if (e) {
        setDepartureStops(e.map(({ value }) => value));
      } else {
        setDepartureStops([]);
      }
    },
    [setDepartureStops],
  );

  return (
    <>
      <h2 className="text-center text-white">Registrer ny kansellering</h2>
      <br></br>
      {lines && (
        <div className="choose_type">
          <LinePicker lines={lines} onChange={handleChangeLine} />
        </div>
      )}
      {chosenLine && (
        <div>
          <br></br>
          <p className="text-center text-white">Dato (driftsdøgn)</p>
          <DatePicker
            label="Velg dato"
            selectedDate={departureDate}
            onChange={handleDepartureDateChange}
            minDate={today(getLocalTimeZone())}
          />
          <Contrast>
            <Button width="fluid" onClick={callApiDeparture}>
              Søk avganger
            </Button>
          </Contrast>
        </div>
      )}

      {chosenLine && departures.length > 0 && (
        <div className="choose_type">
          <br></br>
          <p className="text-center text-white">Velg avgang</p>
          <Select
            placeholder=" "
            onChange={handleChangeDeparture}
            options={serviceJourneyOptions}
          />
        </div>
      )}

      {chosenDeparture && (
        <div className="form-check d-flex">
          <label className="form-check-label" htmlFor="gridCheck2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isDepartureStops}
              onChange={() => {
                setIsDepartureStops(!isDepartureStops);
              }}
            />
            <p className="text-center text-white">
              Gjelder kanselleringen for spesifikke stopp?
            </p>
          </label>
        </div>
      )}

      {chosenDeparture && isDepartureStops && (
        <div>
          <StopPicker
            isMulti
            api={api}
            stops={
              departures
                .find(({ id }) => id === chosenDeparture)
                ?.estimatedCalls.map(({ quay }) => quay) || []
            }
            onChange={onDepartureStopsChange}
          />
          <br></br>
        </div>
      )}

      <br></br>
      <div className="submit justify-content-center">
        <Contrast>
          <ButtonGroup>
            <Button disabled={chosenDeparture === null} onClick={handleSubmit}>
              Registrer
            </Button>
            <SecondaryButton onClick={handleCancel}>Tilbake</SecondaryButton>
          </ButtonGroup>
        </Contrast>
      </div>
    </>
  );
};
