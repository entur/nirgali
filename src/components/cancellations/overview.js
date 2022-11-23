import { useMemo } from 'react';
import red from '../../img/red.png';
import green from '../../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Contrast } from '@entur/layout';
import { useNavigate } from 'react-router-dom';
import { addMinutes, lightFormat, subMinutes } from 'date-fns';

const returnRedOrGreenIcon = (param) => {
  console.log({ param });
  if (
    param.EstimatedVehicleJourney.ExpiresAtEpochMs >
    addMinutes(new Date(), 10).getTime()
  ) {
    return <img src={green} id="active" alt="" height="30" width="30" />;
  } else {
    return <img src={red} id="not_active" alt="" height="30" width="30" />;
  }
};

const Overview = ({ cancellations, lines }) => {
  const date = useMemo(() => Date.now(), []);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/kanselleringer/ny');
  };

  const edit = (id) => {
    navigate(`/kanselleringer/${id}`);
  };

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
      {cancellations && (
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
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {cancellations.map(({ id, data: item }, index) => (
                <Tr key={item.EstimatedVehicleJourney.RecordedAtTime}>
                  <Td className="Status">{returnRedOrGreenIcon(item, date)}</Td>
                  <Td className="#">
                    {
                      lines.find(
                        (l) => l.id === item.EstimatedVehicleJourney.LineRef
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
                    {lightFormat(
                      Date.parse(
                        item.EstimatedVehicleJourney.EstimatedCalls
                          .EstimatedCall[0].AimedDepartureTime
                      ),
                      'HH:mm'
                    )}
                  </Td>
                  <Td>
                    {
                      item.EstimatedVehicleJourney.FramedVehicleJourneyRef
                        .DataFrameRef
                    }
                  </Td>
                  <Td>
                    <Button
                      variant="secondary"
                      value={index}
                      onClick={() => edit(id)}
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
