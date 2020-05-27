import React from 'react';
import red from '../img/red.png';
import green from '../img/green.png';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Switch } from '@entur/form';
import { Contrast } from '@entur/layout';
import { sortBySituationNumber } from '../util/sort';
import format from 'date-fns/format';

class Overview extends React.Component {
  state = {
    date: new Date(),
    showExpiredMessages: false
  };

  handleClick = () => {
    this.props.history.push('/register');
  };

  returnRedOrGreenIcon = param => {
    if (
      Date.parse(param.ValidityPeriod.EndTime) < this.state.date ||
      param.Progress === 'closed'
    ) {
      return <img src={red} id="not_active" alt="" height="30" width="30" />;
    } else {
      return <img src={green} id="active" alt="" height="30" width="30" />;
    }
  };

  getType = param => {
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

  getDate = param => {
    return param ? format(new Date(param), 'HH:mm dd.MM.yyyy') : 'Ikke oppgitt';
  };

  edit = id => {
    this.props.history.push(`/edit/${id}`);
  };

  render() {
    let messages = this.state.showExpiredMessages
      ? this.props.messages
      : this.props.messages.filter(({ data: message }) => {
          return (
            !message.ValidityPeriod.EndTime ||
            Date.parse(message.ValidityPeriod.EndTime) >
              Date.parse(this.state.date)
          );
        });

    messages = messages.sort(sortBySituationNumber);

    return (
      <div>
        <div className="register_box">
          <h2 className="text-center text-white">Oversikt</h2>
          <br></br>
          <div>
            <Contrast>
              <SecondaryButton width="fluid" onClick={this.handleClick}>
                Ny melding
              </SecondaryButton>
            </Contrast>
          </div>
          <br></br>
          <Contrast>
            <div style={{ padding: '0 .5em' }}>
              <Switch
                checked={this.state.showExpiredMessages}
                onChange={() =>
                  this.setState({
                    showExpiredMessages: !this.state.showExpiredMessages
                  })
                }
              >
                Vis utløpte meldinger
              </Switch>
            </div>
          </Contrast>
          <br></br>
          {messages && (
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
                  {messages.map(({ id, data: item }, index) => (
                    <Tr key={item.SituationNumber}>
                      <Td className="Status">
                        {this.returnRedOrGreenIcon(item)}
                      </Td>
                      <Td className="#">
                        {item.SituationNumber.split(':').pop()}
                      </Td>
                      <Td className="Melding" width="25%">
                        {item.Summary['_text']}
                      </Td>
                      <Td className="ReportType">{item.ReportType}</Td>
                      <Td className="Fra-dato">
                        {this.getDate(item.ValidityPeriod.StartTime)}
                      </Td>
                      <Td className="Til-dato">
                        {this.getDate(item.ValidityPeriod.EndTime)}
                      </Td>
                      <Td className="Type">{this.getType(item.Affects)}</Td>
                      <Td>
                        <Button
                          variant="secondary"
                          value={index}
                          onClick={() => this.edit(id)}
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
        </div>
      </div>
    );
  }
}

export default Overview;
