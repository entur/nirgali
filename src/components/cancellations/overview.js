import { useCallback, useMemo, useState } from 'react';
import red from '../../img/red.png';
import green from '../../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Contrast } from '@entur/layout';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@entur/form';
import { sortCancellationByExpiry } from '../../util/sort';
import { getLocalTimeZone, now } from '@internationalized/date';

const returnRedOrGreenIcon = (param) => {
  if (
    param.EstimatedVehicleJourney.ExpiresAtEpochMs >
    now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime()
  ) {
    return <img src={green} id="active" alt="" height="30" width="30" />;
  } else {
    return <img src={red} id="not_active" alt="" height="30" width="30" />;
  }
};

const getCancellationLabel = (item) => {
  if (item.EstimatedVehicleJourney.Cancellation) {
    return 'Ja';
  } else if (
    item.EstimatedVehicleJourney.EstimatedCalls.EstimatedCall.some(
      (call) => call.Cancellation,
    )
  ) {
    return 'Delvis';
  } else {
    return 'Nei';
  }
};

const Overview = ({ cancellations, lines }) => {
  const navigate = useNavigate();
  const [showExpiredCancellations, setShowExpiredCancellations] =
    useState(false);

  const handleClick = useCallback(() => {
    navigate('/kanselleringer/ny');
  }, [navigate]);

  const edit = useCallback(
    (id) => {
      navigate(`/kanselleringer/${id}`);
    },
    [navigate],
  );

  const cancellationsToShow = useMemo(() => {
    return showExpiredCancellations
      ? cancellations.sort(sortCancellationByExpiry)
      : cancellations
          .filter((cancellation) => {
            return (
              cancellation.data.EstimatedVehicleJourney.ExpiresAtEpochMs >
              Date.now() + 600000
            );
          })
          .sort(sortCancellationByExpiry);
  }, [showExpiredCancellations, cancellations]);

  const onShowExpiredCancellationsChange = useCallback(() => {
    setShowExpiredCancellations(!showExpiredCancellations);
  }, [showExpiredCancellations]);

  const getEditCallback = useCallback((id) => () => edit(id), [edit]);

  return (
    <>
      <h2 className="text-center text-white">Oversikt</h2>
      <br></br>
      <div>
        <Contrast>
          <SecondaryButton width="fluid" onClick={handleClick}>
            Ny kansellering
          </SecondaryButton>
        </Contrast>
      </div>
      <br></br>
      <Contrast>
        <div style={{ padding: '0 .5em' }}>
          <Switch
            checked={showExpiredCancellations}
            onChange={onShowExpiredCancellationsChange}
          >
            Vis utløpte kanselleringer
          </Switch>
        </div>
      </Contrast>
      <br></br>
      {cancellationsToShow && (
        <div className="table-responsive-md">
          <Table
            id="dtOrderExample"
            className="table table-striped table-light table-borderless table-hover"
            bgcolor="#000000"
          >
            <Thead className="bg-primary">
              <Tr bgcolor="#babbcf">
                <Th scope="col">
                  <b>Status</b>
                </Th>
                <Th scope="col">
                  <b>Linje</b>
                </Th>
                <Th scope="col">
                  <b>Tur</b>
                </Th>
                <Th scope="col">
                  <b>Fra stasjon</b>
                </Th>
                <Th scope="col">
                  <b>Planlagt avgang</b>
                </Th>
                <Th scope="col">
                  <b>Dato</b>
                </Th>
                <Th scope="col">
                  <b>Kansellert</b>
                </Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {cancellationsToShow.map(({ id, data: item }, index) => (
                <Tr key={item.EstimatedVehicleJourney.RecordedAtTime}>
                  <Td className="Status">{returnRedOrGreenIcon(item)}</Td>
                  <Td className="#">
                    {
                      lines.find(
                        (l) => l.id === item.EstimatedVehicleJourney.LineRef,
                      )?.publicCode
                    }{' '}
                    ({item.EstimatedVehicleJourney.LineRef})
                  </Td>
                  <Td>
                    {
                      item.EstimatedVehicleJourney.FramedVehicleJourneyRef
                        .DatedVehicleJourneyRef
                    }
                  </Td>
                  <Td>
                    {
                      item.EstimatedVehicleJourney.EstimatedCalls
                        .EstimatedCall[0].StopPointName
                    }
                  </Td>
                  <Td>
                    {new Date(
                      Date.parse(
                        item.EstimatedVehicleJourney.EstimatedCalls
                          .EstimatedCall[0].AimedDepartureTime,
                      ),
                    ).toLocaleTimeString(navigator.language, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Td>
                  <Td>
                    {
                      item.EstimatedVehicleJourney.FramedVehicleJourneyRef
                        .DataFrameRef
                    }
                  </Td>
                  <Td>{getCancellationLabel(item)}</Td>
                  <Td>
                    <Button
                      variant="secondary"
                      value={index}
                      onClick={getEditCallback(id)}
                      disabled={
                        item.EstimatedVehicleJourney.ExpiresAtEpochMs <=
                        now(getLocalTimeZone())
                          .add({ minutes: 10 })
                          .toDate()
                          .getTime()
                      }
                    >
                      Endre
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default Overview;
