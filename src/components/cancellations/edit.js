import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PrimaryButton as Button,
  NegativeButton,
  ButtonGroup,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@entur/datepicker';
import StopPicker from '../common/stop-picker';
import { mapEstimatedCall } from './mapEstimatedCall';
import { getLineOption } from '../../util/getLineOption';
import { now, parseDate } from '@internationalized/date';

const Edit = ({ cancellations, organization, lines, api, refetch }) => {
  const navigate = useNavigate();
  const { id: cancellationId } = useParams();

  const cancellation = useMemo(
    () => cancellations.find(({ id }) => id === cancellationId),
    [cancellations, cancellationId],
  );

  const [serviceJourney, setServiceJourney] = useState(undefined);
  const [isDepartureStops, setIsDepartureStops] = useState(false);
  const [departureStops, setDepartureStops] = useState([]);

  useEffect(() => {
    if (cancellation) {
      const { datedVehicleJourneyRef, dataFrameRef } =
        cancellation.estimatedVehicleJourney.framedVehicleJourneyRef;
      api
        .getServiceJourney(datedVehicleJourneyRef, dataFrameRef)
        .then(({ data }) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [cancellationId, api, cancellation]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      cancellation.estimatedVehicleJourney.cancellation =
        !isDepartureStops && departureStops.length === 0;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall =
        serviceJourney.estimatedCalls.map((call) =>
          mapEstimatedCall(call, serviceJourney, departureStops),
        );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      const authority = organization;

      await api.createOrUpdateCancellation(codespace, authority, cancellation);

      await refetch();

      navigate('/kanselleringer');
    },
    [
      api,
      refetch,
      cancellation,
      departureStops,
      isDepartureStops,
      navigate,
      organization,
      serviceJourney,
    ],
  );

  const handleRestore = useCallback(
    async (event) => {
      event.preventDefault();

      const newCancellation = false;
      const newDepartureStatus = 'onTime';
      const newArrivalStatus = 'onTime';

      cancellation.estimatedVehicleJourney.cancellation = newCancellation;
      cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.forEach(
        (call) => {
          call.cancellation = newCancellation;

          if (call.arrivalStatus) {
            call.arrivalStatus = newArrivalStatus;
          }

          if (call.arrivalBoardingActivity) {
            call.arrivalBoardingActivity = serviceJourney.passingTimes.find(
              ({ quay }) => quay.id === call.stopPointRef,
            )?.forAlighting
              ? 'alighting'
              : 'noAlighting';
          }

          if (call.departureStatus) {
            call.departureStatus = newDepartureStatus;
          }

          if (call.departureBoardingActivity) {
            call.departureBoardingActivity = serviceJourney.passingTimes.find(
              ({ quay }) => quay.id === call.stopPointRef,
            )?.forBoarding
              ? 'boarding'
              : 'noBoarding';
          }
        },
      );
      cancellation.estimatedVehicleJourney.recordedAtTime =
        new Date().toISOString();

      const codespace = organization.split(':')[0];
      const authority = organization;

      await api.createOrUpdateCancellation(codespace, authority, cancellation);

      await refetch();

      navigate('/kanselleringer');
    },
    [api, refetch, cancellation, navigate, organization, serviceJourney],
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
    return cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall
      .filter((call) => call.Cancellation)
      .map((call) => call.stopPointRef)
      .map(
        (ref) =>
          serviceJourney.estimatedCalls.find((call) => call.quay.id === ref)
            ?.quay,
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
    [isDepartureStops, setIsDepartureStops],
  );

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
                selectedDate={parseDate(
                  cancellation.estimatedVehicleJourney.framedVehicleJourneyRef
                    .dataFrameRef,
                )}
                disabled
                dateFormats={['yyyy-MM-dd']}
                minDate={now()}
                onChange={() => {}}
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
          !cancellation.estimatedVehicleJourney.cancellation &&
          cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
            (call) => call.cancellation,
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
          !cancellation.estimatedVehicleJourney.cancellation &&
          !cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
            (call) => call.cancellation,
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
            {cancellation.estimatedVehicleJourney.cancellation ||
            cancellation.estimatedVehicleJourney.estimatedCalls.estimatedCall.some(
              (call) => call.Cancellation,
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
