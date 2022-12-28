import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PrimaryButton as Button,
  NegativeButton,
  ButtonGroup,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { DatePicker } from '@entur/datepicker';
import StopPicker from '../stop-picker';
import { mapEstimatedCall } from './mapEstimatedCall';
import { getLineOption } from '../../util/getLineOption';

const Edit = ({ cancellations, organization, lines, api }) => {
  const db = firebase.firestore();
  const navigate = useNavigate();
  const { id: cancellationId } = useParams();

  const cancellation = useMemo(
    () => cancellations.find(({ id }) => id === cancellationId),
    [cancellations, cancellationId]
  );

  const [serviceJourney, setServiceJourney] = useState(undefined);
  const [isDepartureStops, setIsDepartureStops] = useState(false);
  const [departureStops, setDepartureStops] = useState([]);

  useEffect(() => {
    if (cancellation) {
      const { DatedVehicleJourneyRef, DataFrameRef } =
        cancellation.data.EstimatedVehicleJourney.FramedVehicleJourneyRef;
      api
        .getServiceJourney(DatedVehicleJourneyRef, DataFrameRef)
        .then(({ data }) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [cancellationId, api, cancellation]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      cancellation.data.EstimatedVehicleJourney.Cancellation =
        !isDepartureStops && departureStops.length === 0;
      cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall =
        serviceJourney.estimatedCalls.map((call) =>
          mapEstimatedCall(call, serviceJourney, departureStops)
        );
      cancellation.data.EstimatedVehicleJourney.RecordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      const authority = organization;
      const id = cancellation.id;

      db.doc(
        `codespaces/${codespace}/authorities/${authority}/cancellations/${id}`
      )
        .set(cancellation.data)
        .then(() => navigate('/kanselleringer'));
    },
    [
      cancellation,
      db,
      departureStops,
      isDepartureStops,
      navigate,
      organization,
      serviceJourney,
    ]
  );

  const handleRestore = useCallback(
    (event) => {
      event.preventDefault();

      const newCancellation = false;
      const newDepartureStatus = 'onTime';
      const newArrivalStatus = 'onTime';

      cancellation.data.EstimatedVehicleJourney.Cancellation = newCancellation;
      cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.forEach(
        (call) => {
          call.Cancellation = newCancellation;

          if (call.ArrivalStatus) {
            call.ArrivalStatus = newArrivalStatus;
          }

          if (call.ArrivalBoardingActivity) {
            call.ArrivalBoardingActivity = serviceJourney.passingTimes.find(
              ({ quay }) => quay.id === call.StopPointRef
            ).forAlighting
              ? 'alighting'
              : 'noAlighting';
          }

          if (call.DepartureStatus) {
            call.DepartureStatus = newDepartureStatus;
          }

          if (call.DepartureBoardingActivity) {
            call.DepartureBoardingActivity = serviceJourney.passingTimes.find(
              ({ quay }) => quay.id === call.StopPointRef
            ).forBoarding
              ? 'boarding'
              : 'noBoarding';
          }
        }
      );
      cancellation.data.EstimatedVehicleJourney.RecordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      const authority = organization;
      const id = cancellation.id;

      db.doc(
        `codespaces/${codespace}/authorities/${authority}/cancellations/${id}`
      )
        .set(cancellation.data)
        .then(() => navigate('/kanselleringer'));
    },
    [cancellation, db, navigate, organization, serviceJourney]
  );

  const handleCancel = useCallback(() => {
    navigate('/kanselleringer');
  }, [navigate]);

  const getLineDepartureOption = () => {
    const estimatedCall = serviceJourney.estimatedCalls[0];
    const quayName = estimatedCall.quay.name;
    const aimedDepartureTime = estimatedCall.aimedDepartureTime
      .split('T')
      .pop()
      .split(':00+')[0];

    return {
      value: quayName,
      label: `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`,
    };
  };

  const getQuayOptions = () => {
    return cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.filter(
      (call) => call.Cancellation
    )
      .map((call) => call.StopPointRef)
      .map(
        (ref) =>
          serviceJourney.estimatedCalls.find((call) => call.quay.id === ref)
            ?.quay
      )
      .filter((v) => v !== undefined)
      .map((quay) => ({
        value: quay.id,
        label: `${quay.name} - ${quay.id}`,
      }));
  };

  const onIsDepartureStopsChange = useCallback(
    (e) => {
      setIsDepartureStops(!isDepartureStops);
    },
    [isDepartureStops, setIsDepartureStops]
  );

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

  if (!cancellation || !lines?.length) {
    return null;
  }

  return (
    <>
      <form className="register" onSubmit={handleSubmit} autoComplete="off">
        <br></br>
        <h2 className="text-center text-white">Endre kansellering</h2>
        <br></br>
        <p className="text-center text-white">Avgang</p>

        {serviceJourney && (
          <>
            <div className="choose_type">
              <Select
                value={getLineOption(lines, serviceJourney.line.id)}
                options={[getLineOption(lines, serviceJourney.line.id)]}
              />
            </div>

            <div>
              <br></br>
              <p className="text-center text-white">Dato (driftsdøgn)</p>
              <DatePicker
                label="Dato"
                selectedDate={Date.parse(cancellation.data.EstimatedVehicleJourney
                  .FramedVehicleJourneyRef.DataFrameRef)}
                disabled
                dateFormats={['yyyy-MM-dd']}
                minDate={new Date()}
              />
            </div>

            <br></br>
            <div className="choose_type">
              <Select
                value={getLineDepartureOption()}
                options={[getLineDepartureOption()]}
              />
            </div>
          </>
        )}
        {serviceJourney &&
          !cancellation.data.EstimatedVehicleJourney.Cancellation &&
          cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.some(
            (call) => call.Cancellation
          ) && (
            <div>
              <Select
                isMulti
                value={getQuayOptions()}
                options={[getQuayOptions()]}
              />
              <br></br>
            </div>
          )}

        {serviceJourney &&
          !cancellation.data.EstimatedVehicleJourney.Cancellation &&
          !cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.some(
            (call) => call.Cancellation
          ) && (
            <>
              <div className="form-check d-flex">
                <label className="form-check-label" htmlFor="gridCheck2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isDepartureStops}
                    onChange={onIsDepartureStopsChange}
                  />
                  <p className="text-center text-white">
                    Gjelder kanselleringen for spesifikke stopp?
                  </p>
                </label>
              </div>
              {isDepartureStops && (
                <div>
                  <StopPicker
                    isMulti
                    api={api}
                    stops={
                      serviceJourney?.estimatedCalls.map(({ quay }) => quay) ||
                      []
                    }
                    onChange={onDepartureStopsChange}
                  />
                  <br></br>
                </div>
              )}
            </>
          )}

        <br></br>
        <Contrast>
          <ButtonGroup>
            {cancellation.data.EstimatedVehicleJourney.Cancellation ||
            cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.some(
              (call) => call.Cancellation
            ) ? (
              <NegativeButton type="button" onClick={handleRestore}>
                <>Gjenopprett avgang</>
              </NegativeButton>
            ) : (
              <NegativeButton type="button" onClick={handleSubmit}>
                <>Kanseller avgang</>
              </NegativeButton>
            )}

            <Button onClick={handleCancel} type="submit">
              Lukk uten å lagre
            </Button>
          </ButtonGroup>
        </Contrast>
      </form>
    </>
  );
};

export default Edit;
