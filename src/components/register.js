import React from 'react';
import Select from 'react-select';
import api from '../api/api';
import 'flatpickr/dist/themes/material_blue.css';
import Flatpickr from 'react-flatpickr';
import { Button } from '@entur/component-library';

class Register extends React.Component {
  state = {
    newAffect: '',
    searchBar: '',
    stops: '',
    departures: '',
    type: undefined,
    chosenLine: undefined,
    departure: undefined,
    checkbox: undefined,
    checkbox2: undefined,
    multiples: undefined,
    dateFromTo: undefined,
    message: undefined,
    submit: undefined,
    departureSok: undefined,
    counter: 0,
    date: undefined,
    departureDate: undefined,
    from: undefined,
    to: undefined
  };

  componentDidMount() {
    const now = new Date();
    this.setState({
      date: now,
      from: now,
      departureDate: now
    });
  }

  createStops = () => {
    let stop = [];
    this.props.lines.map(item => (stop = stop.concat(item.quays)));

    this.setState({
      stops: stop
    });
  };

  createNewLine = () => {
    return {
      Networks: {
        AffectedNetwork: { AffectedLine: { LineRef: this.state.chosenLine } }
      }
    };
  };

  createAffectedRoute = () => {
    return {
      StopPoints: {
        AffectedStopPoint: this.state.multipleStops.map(item => ({
          StopPointRef: item.value
        }))
      }
    };
  };

  createAffectedRouteLine = () => {
    return this.state.multipleStops.map(item => ({
      AffectedStopPoint: { StopPointRef: item.value }
    }));
  };

  createNewSpecifiedStops = () => {
    return {
      Networks: {
        AffectedNetwork: {
          AffectedLine: {
            LineRef: this.state.chosenLine,
            Routes: {
              AffectedRoute: { StopPoints: this.createAffectedRouteLine() }
            }
          }
        }
      }
    };
  };

  createAffectedDeparture = () => {
    return {
      VehicleJourneys: {
        AffectedVehicleJourney: {
          FramedVehicleJourneyRef: {
            DataFrameRef: document.getElementById('date').value,
            DatedVehicleJourneyRef: this.state.chosenLine
          },
          Route: null
        }
      }
    };
  };

  createNewSpecifiedStopsDeparture = () => {
    return {
      VehicleJourneys: {
        AffectedVehicleJourney: {
          FramedVehicleJourneyRef: {
            DataFrameRef: document.getElementById('date').value,
            DatedVehicleJourneyRef: this.state.chosenLine
          },
          Route: this.createAffectedRoute()
        }
      }
    };
  };

  handleClick = () => {
    this.props.history.push('/');
  };

  handleSubmit = async event => {
    event.preventDefault();

    const target = event.target;

    const newIssue = await this.createNewIssue(target);

    if (target.beskrivelse.value === '') {
      delete newIssue.Description;
    }

    if (target.forslag.value === '') {
      delete newIssue.Advice;
    }

    if (this.state.type === 'departure') {
      const from = new Date(this.state.departureDate);
      const to = new Date(this.state.departureDate);
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      from.setMilliseconds(0);
      to.setHours(23);
      to.setMinutes(59);
      to.setSeconds(59);
      to.setMilliseconds(999);
      newIssue.ValidityPeriod = {
        StartTime: from.toISOString(),
        EndTime: to.toISOString()
      };
    } else {
      if (target.to.value) {
        newIssue.ValidityPeriod = {
          StartTime: this.state.from.toISOString(),
          EndTime: this.state.to.toISOString()
        };
      } else {
        newIssue.ValidityPeriod = {
          StartTime: this.state.from.toISOString()
        };
      }
    }

    if (this.state.type === 'line') {
      if (this.state.checkbox) {
        const newAffect = this.createNewSpecifiedStops();
        newIssue.Affects = newAffect;
      } else {
        const newAffect = this.createNewLine();
        newIssue.Affects = newAffect;
      }
    }
    if (this.state.type === 'stop') {
      const newAffect = this.createAffectedRoute();
      newIssue.Affects = newAffect;
    }
    if (this.state.type === 'departure') {
      if (this.state.checkbox2) {
        const newAffect = this.createNewSpecifiedStopsDeparture();
        newIssue.Affects = newAffect;
      } else {
        const newAffect = this.createAffectedDeparture();
        newIssue.Affects = newAffect;
      }
    }

    this.props.firebase
      .collection(
        `codespaces/${this.props.organization.split(':')[0]}/authorities/${
          this.props.organization
        }/messages`
      )
      .doc()
      .set(newIssue);
    this.props.history.push('/');
  };

  createNewIssue = async target => {
    const count = await this.getNextSituationNumber();
    return {
      CreationTime: this.state.date.toISOString(),
      ParticipantRef: this.props.organization.split(':')[0],
      SituationNumber:
        this.props.organization.split(':')[0] + ':SituationNumber:' + count,
      Source: {
        SourceType: 'directReport'
      },
      Progress: 'open',
      ValidityPeriod: null,
      Severity: 'normal',
      ReportType: target.ReportType.value,
      Summary: {
        _attributes: {
          'xml:lang': 'NO'
        },
        _text: target.oppsummering.value
      },
      Description: {
        _attributes: {
          'xml:lang': 'NO'
        },
        _text: target.beskrivelse.value
      },
      Advice: {
        _attributes: {
          'xml:lang': 'NO'
        },
        _text: target.forslag.value
      },
      Affects: []
    };
  };

  getNextSituationNumber = () => {
    const codespace = this.props.organization.split(':')[0];
    const codespaceDocRef = this.props.firebase.doc(`codespaces/${codespace}`);
    return this.props.firebase.runTransaction(
      this.getNextSituationNumberTransaction(codespaceDocRef)
    );
  };

  getNextSituationNumberTransaction = codespaceDocRef => async transaction => {
    const codespaceDoc = await transaction.get(codespaceDocRef);

    if (!codespaceDoc.exists) {
      await transaction.set(codespaceDocRef, {
        nextSituationNumber: 2
      });
      return 1;
    } else {
      let nextSituationNumber = codespaceDoc.data().nextSituationNumber;
      await transaction.update(codespaceDocRef, {
        nextSituationNumber: nextSituationNumber + 1
      });
      return nextSituationNumber;
    }
  };

  handleChangeType = event => {
    this.createStops();
    if (this.state.departureSok) {
      this.setState({
        message: undefined
      });
    }
    this.setState({
      type: event.target.value,
      checkbox: undefined,
      checkbox2: undefined,
      chosenLine: undefined,
      departureSok: undefined,
      submit: undefined,
      departure: undefined
    });
    if (event.target.value === 'departure') {
      this.setState({
        departure: true,
        dateFromTo: undefined,
        message: undefined
      });
    }
  };

  handleChangeLine = event => {
    if (this.state.type === 'departure') {
      this.setState({
        chosenLine: event.value
      });
    } else {
      this.setState({
        chosenLine: event.value,
        dateFromTo: true,
        message: true,
        submit: true
      });
    }
  };

  handleChangeDeparture = event => {
    this.setState({
      chosenLine: event.value,
      message: true,
      submit: true
    });
  };

  handleChangeSpecifiedStops = event => {
    this.setState({
      multipleStops: event,
      dateFromTo: true,
      message: true,
      submit: true
    });
  };

  handleChangeSpecifyStopsLine = () => {
    const checkBox = document.getElementById('gridCheck');
    if (checkBox.checked === true) {
      this.setState({
        checkbox: true
      });
    } else {
      this.setState({
        checkbox: undefined
      });
    }
  };

  handleChangeSpecifyStopsDeparture = () => {
    const checkBox = document.getElementById('gridCheck2');
    if (checkBox.checked === true) {
      this.setState({
        checkbox2: true
      });
    } else {
      this.setState({
        checkbox2: undefined
      });
    }
  };

  handleChangeSpecifiedStopsDeparture = event => {
    this.setState({ multipleStops: event });
  };

  callApiDeparture = () => {
    const date = document.getElementById('date').value;
    const line = this.state.chosenLine;

    api.getDepartures(line, date).then(response => {
      this.setState({
        departures: response.data.serviceJourneys,
        departureSok: true
      });
    });
  };

  returnMappedObjects = list => {
    if (list[0].stopPlace) {
      return list.map(item => ({
        label: item.name + ' - ' + item.stopPlace.id,
        value: item.stopPlace.id
      }));
    } else {
      return list.map(item => ({
        label: item.name + ' - ' + item.id,
        value: item.id
      }));
    }
  };

  returnSpecifiedLines = () => {
    const tmp = this.props.lines.find(
      item => item.id === this.state.chosenLine
    );

    if (tmp) {
      return this.returnMappedObjects(tmp.quays);
    }
    return [];
  };

  returnSpecifiedLinesDeparture = () => {
    const tmp = this.state.departures.find(
      item => item.id === this.state.chosenLine
    );

    if (tmp) {
      return tmp.estimatedCalls.map(item => ({
        label: item.quay.name + ' - ' + item.quay.stopPlace.id,
        value: item.quay.stopPlace.id
      }));
    }
    return [];
  };

  returnServiceJourney = () => {
    return this.state.departures
      .map(item => ({
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
        value: item.id
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
  };

  render() {
    return (
      <div>
        <div className="register_box">
          <form
            className="register"
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <h2 className="text-center text-white">Registrer ny melding</h2>
            <br></br>
            <div className="choose_type">
              <p className="text-center text-white">
                Velg linje, stopp eller avgang
              </p>
              <select
                className="browser-default custom-select"
                defaultValue={'default'}
                onChange={this.handleChangeType}
              >
                <option value="default" disabled>
                  {' '}
                </option>
                <option value="line">Linje</option>
                <option value="stop">Stopp</option>
                <option value="departure">Avgang</option>
              </select>
            </div>
            {this.props.lines && (
              <div className="choose_type">
                {(this.state.type === 'line' ||
                  this.state.type === 'departure') && (
                  <Select
                    placeholder="Velg linje"
                    onChange={this.handleChangeLine}
                    options={this.returnMappedObjects(this.props.lines)}
                  />
                )}

                {this.state.type === 'line' && this.state.chosenLine && (
                  <div className="form-check d-flex">
                    <label className="form-check-label" htmlFor="gridCheck">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="gridCheck"
                        value="stops"
                        onChange={this.handleChangeSpecifyStopsLine}
                      />
                      <p className="text-center text-white">
                        Gjelder avviket for spesifikke stopp?
                      </p>
                    </label>
                  </div>
                )}

                {this.state.type === 'line' &&
                  this.state.chosenLine &&
                  this.state.checkbox && (
                    <div>
                      <Select
                        isMulti
                        placeholder=" "
                        onChange={this.handleChangeSpecifiedStops}
                        options={this.returnSpecifiedLines()}
                      />
                      <br></br>
                    </div>
                  )}

                {this.state.type === 'stop' && this.state.stops && (
                  <div>
                    <Select
                      isMulti
                      placeholder="Velg stopp"
                      onChange={this.handleChangeSpecifiedStops}
                      options={this.returnMappedObjects(this.state.stops)}
                    />
                    <br></br>
                  </div>
                )}
              </div>
            )}
            {this.state.departure && this.state.chosenLine && (
              <div>
                <br></br>
                <p className="text-center text-white">Gyldighetsperiode</p>
                <Flatpickr
                  id="date"
                  name="to"
                  className="form-control"
                  options={{
                    enableTime: false,
                    minDate: this.state.date,
                    dateFormat: 'Y-m-d'
                  }}
                  value={this.state.departureDate}
                  onValueUpdate={dObj => this.setState({ departureDate: dObj })}
                />
                <button
                  onClick={this.callApiDeparture}
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                >
                  Søk avganger
                </button>
              </div>
            )}

            {this.state.departureSok &&
              this.state.chosenLine &&
              this.state.departures && (
                <div className="choose_type">
                  <br></br>
                  <p className="text-center text-white">Velg avgang</p>
                  <Select
                    placeholder=" "
                    onChange={this.handleChangeDeparture}
                    options={this.returnServiceJourney()}
                  />
                </div>
              )}

            {this.state.departure && this.state.message && (
              <div className="form-check d-flex">
                <label className="form-check-label" htmlFor="gridCheck2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="gridCheck2"
                    value="stops"
                    onChange={this.handleChangeSpecifyStopsDeparture}
                  />
                  <p className="text-center text-white">
                    Gjelder avviket for spesifikke stopp?
                  </p>
                </label>
              </div>
            )}

            {this.state.departure && this.state.checkbox2 && (
              <div>
                <Select
                  isMulti
                  placeholder=" "
                  onChange={this.handleChangeSpecifiedStopsDeparture}
                  options={this.returnSpecifiedLinesDeparture()}
                />
                <br></br>
              </div>
            )}

            {this.state.dateFromTo && (
              <div className="bd-highlight justify-content-center">
                <p className="text-center text-white">Gyldighetsdato</p>
                <div className="form-group d-flex">
                  <Flatpickr
                    data-enable-time
                    id="from"
                    value={this.state.from}
                    name="from"
                    className="date-form form-control"
                    options={{
                      enableTime: true,
                      dateFormat: 'Y-m-d H:i',
                      minDate: this.state.date,
                      time_24hr: true
                    }}
                    onValueUpdate={dObj => this.setState({ from: dObj })}
                  />
                  <Flatpickr
                    id="date-to"
                    data-enable-time
                    name="to"
                    placeholder="Til-dato"
                    className="date-form form-control"
                    options={{
                      enableTime: true,
                      dateFormat: 'Y-m-d H:i',
                      minDate: this.state.from
                        ? this.state.from
                        : this.state.date,
                      time_24hr: true
                    }}
                    onValueUpdate={dObj => this.setState({ to: dObj })}
                  />
                </div>
              </div>
            )}

            {this.state.message && (
              <div>
                <div className="severity&type">
                  <p className="text-center text-white">Rapporttype</p>
                  <select
                    className="form-control"
                    defaultValue={'incident'}
                    name="ReportType"
                  >
                    <option value="incident">Incident</option>
                    <option value="general">General</option>
                  </select>
                  <br></br>
                </div>
                <div className="message">
                  <p className="text-center text-white">Melding</p>
                  <input
                    type="String"
                    name="oppsummering"
                    className="form-control"
                    placeholder="Kort, beskrivende avvikstekst"
                    maxLength="160"
                    required
                  />
                  <input
                    type="String"
                    name="beskrivelse"
                    className="form-control"
                    placeholder="Eventuell utdypende detaljer om avviket (ikke påkrevd)"
                  />
                  <input
                    type="String"
                    name="forslag"
                    className="form-control"
                    placeholder="Beskrivelse om hva kunden skal/kan gjøre (ikke påkrevd)"
                  />
                </div>
              </div>
            )}
            <br></br>
            <div className="submit justify-content-center">
              {this.state.submit && (
                <Button
                  variant="success"
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                >
                  Registrer
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={this.handleClick}
                type="submit"
                className="btn btn-warning btn-lg btn-block"
              >
                Tilbake
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Register;
