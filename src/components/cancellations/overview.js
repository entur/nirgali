import { useMemo } from 'react';
import red from '../../img/red.png';
import green from '../../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Contrast } from '@entur/layout';
import format from 'date-fns/format';
import { useNavigate } from 'react-router-dom';

const returnRedOrGreenIcon = (param, date) => {
  if (
    Date.parse(param.ValidityPeriod.EndTime) < date ||
    param.Progress === 'closed'
  ) {
    return <img src={red} id="not_active" alt="" height="30" width="30" />;
  } else {
    return <img src={green} id="active" alt="" height="30" width="30" />;
  }
};

const getDate = (param) => {
  return param ? format(new Date(param), 'HH:mm dd.MM.yyyy') : 'Ikke oppgitt';
};

const Overview = ({ cancellations }) => {
  const date = useMemo(() => Date.now(), []);
  //const [showExpiredMessages, setShowExpiredMessages] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/kanselleringer/ny');
  };

  const edit = (id) => {
    navigate(`/kanselleringer/${id}`);
  };

  // let messagesToRender = showExpiredMessages
  //   ? messages
  //   : messages.filter(({ data: message }) => {
  //       return (
  //         !message.ValidityPeriod.EndTime ||
  //         Date.parse(message.ValidityPeriod.EndTime) > Date.parse(date)
  //       );
  //     });

  // messagesToRender = messagesToRender.sort(sortBySituationNumber);

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
      {/* <br></br>
      <Contrast>
        <div style={{ padding: '0 .5em' }}>
          <Switch
            checked={showExpiredMessages}
            onChange={() => setShowExpiredMessages(!showExpiredMessages)}
          >
            Vis utløpte meldinger
          </Switch>
        </div>
      </Contrast> */}
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
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <img src={green} id="active" alt="" height="30" width="30" />
                </Td>
                <Td>R20 (NSB:Line:1)</Td>
                <Td>NSB:ServiceJourney:1</Td>
                <Td>Oslo S</Td>
                <Td>19:33</Td>
                <Td>2022-11-22</Td>
              </Tr>
              {cancellations.map(({ id, data: item }, index) => (
                <Tr key={item.SituationNumber}>
                  <Td className="Status">{returnRedOrGreenIcon(item, date)}</Td>
                  <Td className="#">{item.SituationNumber.split(':').pop()}</Td>
                  <Td className="Melding" width="25%">
                    {item.Summary['_text']}
                  </Td>
                  <Td className="ReportType">{item.ReportType}</Td>
                  <Td className="Fra-dato">
                    {getDate(item.ValidityPeriod.StartTime)}
                  </Td>
                  <Td className="Til-dato">
                    {getDate(item.ValidityPeriod.EndTime)}
                  </Td>
                  {/* <Td className="Type">{getType(item.Affects)}</Td> */}
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
