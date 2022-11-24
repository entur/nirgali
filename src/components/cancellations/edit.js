import { useEffect, useMemo, useState } from 'react';
import {
  PrimaryButton as Button,
  NegativeButton,
  ButtonGroup,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import firebase from 'firebase/compat/app';

const Edit = ({ cancellations, organization, lines, api }) => {
  const db = firebase.firestore();
  const navigate = useNavigate();
  const { id: cancellationId } = useParams();

  const cancellation = useMemo(
    () => cancellations.find(({ id }) => id === cancellationId),
    [cancellations, cancellationId]
  );

  const [serviceJourney, setServiceJourney] = useState(undefined);

  useEffect(() => {
    const { DatedVehicleJourneyRef, DataFrameRef } =
      cancellation.data.EstimatedVehicleJourney.FramedVehicleJourneyRef;
    api
      .getServiceJourney(DatedVehicleJourneyRef, DataFrameRef)
      .then(({ data }) => {
        setServiceJourney(data.serviceJourney);
      });
  }, [cancellationId, api, cancellation]);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('submit');

    const newCancellation =
      !cancellation.data.EstimatedVehicleJourney.Cancellation;
    const newDepartureStatus = newCancellation ? 'cancelled' : 'onTime';
    const newArrivalStatus = newCancellation ? 'cancelled' : 'onTime';

    cancellation.data.EstimatedVehicleJourney.Cancellation = newCancellation;
    cancellation.data.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.forEach(
      (call) => {
        call.Cancellation = newCancellation;

        if (call.ArrivalStatus) {
          call.ArrivalStatus = newArrivalStatus;
        }

        if (call.ArrivalBoardingActivity) {
          call.ArrivalBoardingActivity = serviceJourney.estimatedCalls.find(
            ({ quay }) => quay.id === call.StopPointRef
          ).forAlighting
            ? 'alighting'
            : 'noAlighting';
        }

        if (call.DepartureStatus) {
          call.DepartureStatus = newDepartureStatus;
        }

        if (call.DepartureBoardingActivity) {
          call.DepartureBoardingActivity = serviceJourney.estimatedCalls.find(
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
  };

  const handleCancel = () => {
    navigate('/kanselleringer');
  };

  const getLineOption = (id) => {
    const line = lines.find((l) => l.id === id);
    return line
      ? {
          value: line.id,
          label: `${line.name} (${line.publicCode}) - ${line.id}`,
        }
      : {
          label: 'Ukjent linje',
        };
  };

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
        <div className="text-white">
          {
            cancellation.data.EstimatedVehicleJourney.FramedVehicleJourneyRef
              .DataFrameRef
          }
        </div>

        {serviceJourney && (
          <>
            <div className="choose_type">
              <Select
                value={getLineOption(serviceJourney.line.id)}
                options={[getLineOption(serviceJourney.line.id)]}
              />
            </div>

            <div className="choose_type">
              <Select
                value={getLineDepartureOption()}
                options={[getLineDepartureOption()]}
              />
            </div>
          </>
        )}

        <br></br>
        <Contrast>
          <ButtonGroup>
            <NegativeButton type="button" onClick={handleSubmit}>
              {cancellation.data.EstimatedVehicleJourney.Cancellation ? (
                <>Gjenopprett avgang</>
              ) : (
                <>Kanseller avgang</>
              )}
            </NegativeButton>

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
