import React, { useMemo, useState } from 'react';
import red from '../../img/red.png';
import green from '../../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Switch } from '@entur/form';
import { Contrast } from '@entur/layout';
import { sortBySituationNumber } from '../../util/sort';
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

const getType = (param) => {
  if (param != null) {
    if (Object.keys(param)[0] === 'Networks') {
      return 'Linje';
    }
    if (Object.keys(param)[0] === 'StopPoints') {
      return 'Stopp';
    }
    if (Object.keys(param)[0] === 'VehicleJourneys') {
      return 'Avgang';
    } else {
      return 'Error';
    }
  } else {
    return 'Error';
  }
};

const getDate = (param) => {
  return param ? format(new Date(param), 'HH:mm dd.MM.yyyy') : 'Ikke oppgitt';
};

const Overview = ({ messages }) => {
  const date = useMemo(() => Date.now(), []);
  const [showExpiredMessages, setShowExpiredMessages] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/meldinger/ny');
  };

  const edit = (id) => {
    navigate(`/meldinger/${id}`);
  };

  let messagesToRender = showExpiredMessages
    ? messages
    : messages.filter(({ data: message }) => {
        return (
          !message.ValidityPeriod.EndTime ||
          Date.parse(message.ValidityPeriod.EndTime) > Date.parse(date)
        );
      });

  messagesToRender = messagesToRender.sort(sortBySituationNumber);

  return (
    <>
      <h2 className="text-center text-white">Oversikt</h2>
      <br></br>
      <div>
        <Contrast>
          <SecondaryButton width="fluid" onClick={handleClick}>
            Ny melding
          </SecondaryButton>
        </Contrast>
      </div>
      <br></br>
      <Contrast>
        <div style={{ padding: '0 .5em' }}>
          <Switch
            checked={showExpiredMessages}
            onChange={() => setShowExpiredMessages(!showExpiredMessages)}
          >
            Vis utløpte meldinger
          </Switch>
        </div>
      </Contrast>
      <br></br>
      {messagesToRender && (
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
                  <b>#</b>
                </Th>
                <Th scope="col">
                  <b>Oppsummering</b>
                </Th>
                <Th scope="col">
                  <b>Avvikstype</b>
                </Th>
                <Th scope="col">
                  <b>Fra dato</b>
                </Th>
                <Th scope="col">
                  <b>Til dato</b>
                </Th>
                <Th scope="col">
                  <b>Type</b>
                </Th>
                <Th scope="col"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {messagesToRender.map(({ id, data: item }, index) => (
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
                  <Td className="Type">{getType(item.Affects)}</Td>
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
