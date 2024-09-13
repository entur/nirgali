import React, { useCallback, useMemo, useState } from 'react';
import red from '../../img/red.png';
import green from '../../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Switch } from '@entur/form';
import { Contrast } from '@entur/layout';
import { sortBySituationNumber } from '../../util/sort';
import { useNavigate } from 'react-router-dom';
import { DateFormatter } from '@internationalized/date';

const returnRedOrGreenIcon = (param, date) => {
  if (
    Date.parse(param.validityPeriod.endTime) < date ||
    param.progress === 'closed'
  ) {
    return <img src={red} id="not_active" alt="" height="30" width="30" />;
  } else {
    return <img src={green} id="active" alt="" height="30" width="30" />;
  }
};

const getType = (param) => {
  if (param != null) {
    if (Object.keys(param)[0] === 'networks') {
      return 'Linje';
    }
    if (Object.keys(param)[0] === 'stopPoints') {
      return 'Stopp';
    }
    if (Object.keys(param)[0] === 'vehicleJourneys') {
      return 'Avgang';
    } else {
      return 'Error';
    }
  } else {
    return 'Error';
  }
};

const getDate = (param) => {
  const formatter = new DateFormatter('nb-NO');
  return param ? formatter.format(new Date(param)) : 'Ikke oppgitt';
};

const Overview = ({ messages }) => {
  const date = useMemo(() => Date.now(), []);
  const [showExpiredMessages, setShowExpiredMessages] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate('/meldinger/ny');
  }, [navigate]);

  const edit = useCallback(
    (id) => {
      navigate(`/meldinger/${id}`);
    },
    [navigate],
  );

  const getEditCallback = useCallback((id) => () => edit(id), [edit]);

  const onShowExpiredMessagesChange = useCallback(
    () => setShowExpiredMessages(!showExpiredMessages),
    [setShowExpiredMessages, showExpiredMessages],
  );

  const messagesToRender = useMemo(() => {
    let messagesToRender = showExpiredMessages
      ? messages
      : messages.filter((message) => {
          return (
            !message.validityPeriod.endTime ||
            Date.parse(message.validityPeriod.endTime) > date
          );
        });

    return messagesToRender.sort(sortBySituationNumber);
  }, [messages, showExpiredMessages, date]);

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
            onChange={onShowExpiredMessagesChange}
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
              {messagesToRender.map(({ id, ...item }, index) => (
                <Tr key={item.situationNumber}>
                  <Td className="Status">{returnRedOrGreenIcon(item, date)}</Td>
                  <Td className="#">{item.situationNumber.split(':').pop()}</Td>
                  <Td className="Melding" width="25%">
                    {item.summary.text}
                  </Td>
                  <Td className="ReportType">{item.reportType}</Td>
                  <Td className="Fra-dato">
                    {getDate(item.validityPeriod.startTime)}
                  </Td>
                  <Td className="Til-dato">
                    {getDate(item.validityPeriod.endTime)}
                  </Td>
                  <Td className="Type">{getType(item.affects)}</Td>
                  <Td>
                    <Button
                      variant="secondary"
                      value={index}
                      onClick={getEditCallback(id)}
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
