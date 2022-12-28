import React, { useMemo, useCallback } from 'react';
import Select from 'react-select';
import {
  ButtonGroup,
  PrimaryButton as Button,
  SecondaryButton,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import { DatePicker } from '@entur/datepicker';
import { addMinutes, lightFormat } from 'date-fns';
import LinePicker from '../line-picker';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { sortServiceJourneyByDepartureTime } from '../../util/sort';
import StopPicker from '../stop-picker';
import { mapEstimatedCall } from './mapEstimatedCall';

const formatDate = (date) => lightFormat(date, 'yyyy-MM-dd');

export const Register = ({ lines, api, organization }) => {
  const navigate = useNavigate();
  const [chosenLine, setChosenLine] = React.useState(null);
  const [departureDate, setDepartureDate] = React.useState(new Date());
  const [departures, setDepartures] = React.useState([]);
  const [chosenDeparture, setChosenDeparture] = React.useState(null);
  const [isDepartureStops, setIsDepartureStops] = React.useState(false);
  const [departureStops, setDepartureStops] = React.useState([]);

  const handleChangeLine = useCallback(
    (line) => setChosenLine(line.value),
    [setChosenLine]
  );

  const handleDepartureDateChange = useCallback(
    (chosenDate) => setDepartureDate(chosenDate),
    [setDepartureDate]
  );

  const handleChangeDeparture = useCallback(
    (departure) => setChosenDeparture(departure.value),
    [setChosenDeparture]
  );
  const handleSubmit = useCallback(async () => {
    const now = new Date();
    const departureData = departures.find(
      (departure) => departure.id === chosenDeparture
    );
    const newCancellation = {
      EstimatedVehicleJourney: {
        RecordedAtTime: now.toISOString(),
        LineRef: chosenLine,
        DirectionRef: 0,
        FramedVehicleJourneyRef: {
          DataFrameRef: formatDate(departureDate),
          DatedVehicleJourneyRef: chosenDeparture,
        },
        Cancellation: !isDepartureStops && departureStops.length === 0,
        DataSource: organization.split(':')[0],
        EstimatedCalls: {
          EstimatedCall: departureData.estimatedCalls.map((estimatedCall) =>
            mapEstimatedCall(estimatedCall, departureData, departureStops)
          ),
        },
        IsCompleteStopSequence: true,
        ExpiresAtEpochMs:
          Date.parse(
            departureData.estimatedCalls[
              departureData.estimatedCalls.length - 1
            ].aimedArrivalTime
          ) +
          600 * 1000,
      },
    };

    const db = firebase.firestore();
    await db
      .collection(
        `codespaces/${
          organization.split(':')[0]
        }/authorities/${organization}/cancellations`
      )
      .doc()
      .set(newCancellation);
    navigate('/kanselleringer');
  }, [
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
    [navigate]
  );

  const serviceJourneyOptions = useMemo(() => {
    return departures
      .filter(
        (serviceJourney) =>
          Date.parse(
            serviceJourney.estimatedCalls[
              serviceJourney.estimatedCalls.length - 1
            ].aimedArrivalTime
          ) > addMinutes(Date.now(), 10).getTime()
      )
      .sort(sortServiceJourneyByDepartureTime)
      .map((item) => ({
        label:
          item.estimatedCalls[0].aimedDepartureTime
            .split('T')
            .pop()
            .split(':00+')[0] +
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
        formatDate(departureDate)
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
    [setDepartureStops]
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
            dateFormats={['yyyy-MM-dd']}
            minDate={new Date()}
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
