import React, { useMemo, useCallback } from 'react';
import Select from 'react-select';
import {
  ButtonGroup,
  PrimaryButton as Button,
  SecondaryButton,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import { DatePicker } from '@entur/datepicker';
import { lightFormat } from 'date-fns';
import LinePicker from '../line-picker';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';

const formatDate = (date) => lightFormat(date, 'yyyy-MM-dd');

export const Register = ({ lines, api, organization }) => {
  const navigate = useNavigate();
  const [chosenLine, setChosenLine] = React.useState(null);
  const [departureDate, setDepartureDate] = React.useState(null);
  const [departures, setDepartures] = React.useState([]);
  const [chosenDeparture, setChosenDeparture] = React.useState(null);

  const handleChangeLine = (line) => setChosenLine(line.value);
  const handleDepartureDateChange = (chosenDate) =>
    setDepartureDate(chosenDate);
  const handleChangeDeparture = (departure) =>
    setChosenDeparture(departure.value);
  const handleSubmit = async () => {
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
        Cancellation: true,
        DataSource: organization.split(':')[0],
        EstimatedCalls: {
          EstimatedCall: departureData.estimatedCalls.map(
            (estimatedCall, i) => ({
              StopPointRef: estimatedCall.quay.id,
              Order: estimatedCall.stopPositionInPattern + 1,
              StopPointName: estimatedCall.quay.name,
              Cancellation: true,
              RequestStop: estimatedCall.requestStop,
              AimedArrivalTime: i > 0 ? estimatedCall.aimedArrivalTime : null,
              ExpectedArrivalTime:
                i > 0 ? estimatedCall.expectedArrivalTime : null,
              AimedDepartureTime:
                i < departureData.estimatedCalls.length - 1
                  ? estimatedCall.aimedDepartureTime
                  : null,
              ExpectedDepartureTime:
                i < departureData.estimatedCalls.length - 1
                  ? estimatedCall.expectedDepartureTime
                  : null,
              DepartureStatus: 'cancelled',
              DepartureBoardingActivity: 'noBoarding',
            })
          ),
        },
        IsCompleteStopSequence: true,
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
  };
  const handleCancel = () => navigate('/kanselleringer');

  const serviceJourneyOptions = useMemo(() => {
    return departures
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
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
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
          <p className="text-center text-white">Gyldighetsperiode</p>
          <DatePicker
            selectedDate={departureDate}
            onChange={handleDepartureDateChange}
            dateFormat="yyyy-MM-dd"
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
