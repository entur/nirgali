import React from 'react';
import Select from 'react-select';
import { PrimaryButton as Button, SecondaryButton } from '@entur/button';
import { Contrast } from '@entur/layout';
import { DatePicker } from '@entur/datepicker';
import { lightFormat, isBefore } from 'date-fns';
import LinePicker from './line-picker';
import StopPicker from './stop-picker';

const formatDate = (date) => lightFormat(date, 'yyyy-MM-dd');

class Register extends React.Component {
  state = {
    newAffect: '',
    searchBar: '',
    stops: '',
    departures: '',
    type: undefined,
    chosenLine: undefined,
    datedVehicleJourney: undefined,
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
    to: undefined,
    reportType: 'incident',
    oppsummering: '',
    beskrivelse: '',
    forslag: '',
    infoLink: undefined,
  };

  componentDidMount() {
    const now = new Date();
    this.setState({
      date: now,
      from: now,
      departureDate: now,
    });
  }

  createStops = () => {
    const stops = this.props.lines.reduce(
      (acc, line) => [...acc, ...line.quays],
      []
    );

    this.setState({
      stops,
    });
  };

  createNewLine = () => {
    return {
      Networks: {
        AffectedNetwork: { AffectedLine: { LineRef: this.state.chosenLine } },
      },
    };
  };

  createAffectedRoute = () => {
    return {
      StopPoints: {
        AffectedStopPoint: this.state.multipleStops.map((item) => ({
          StopPointRef: item.value,
        })),
      },
    };
  };

  createAffectedRouteLine = () => {
    return {
      AffectedStopPoint: this.state.multipleStops.map((item) => ({
        StopPointRef: item.value,
      })),
    };
  };

  createNewSpecifiedStops = () => {
    return {
      Networks: {
        AffectedNetwork: {
          AffectedLine: {
            LineRef: this.state.chosenLine,
            Routes: {
              AffectedRoute: { StopPoints: this.createAffectedRouteLine() },
            },
          },
        },
      },
    };
  };

  createAffectedDeparture = () => {
    return {
      VehicleJourneys: {
        AffectedVehicleJourney: {
          FramedVehicleJourneyRef: {
            DataFrameRef: formatDate(this.state.departureDate),
            DatedVehicleJourneyRef: this.state.datedVehicleJourney,
          },
          Route: null,
        },
      },
    };
  };

  createNewSpecifiedStopsDeparture = () => {
    return {
      VehicleJourneys: {
        AffectedVehicleJourney: {
          FramedVehicleJourneyRef: {
            DataFrameRef: formatDate(this.state.departureDate),
            DatedVehicleJourneyRef: this.state.datedVehicleJourney,
          },
          Route: this.createAffectedRoute(),
        },
      },
    };
  };

  handleClick = () => {
    this.props.history.push('/');
  };

  handleSubmit = async (event) => {
    const newIssue = await this.createNewIssue();

    if (this.state.beskrivelse === '') {
      delete newIssue.Description;
    }

    if (this.state.forslag === '') {
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
        EndTime: to.toISOString(),
      };
    } else {
      if (this.state.to) {
        newIssue.ValidityPeriod = {
          StartTime: this.state.from.toISOString(),
          EndTime: this.state.to.toISOString(),
        };
      } else {
        newIssue.ValidityPeriod = {
          StartTime: this.state.from.toISOString(),
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

    if (this.state.infoLink) {
      newIssue.InfoLinks = {
        InfoLink: {
          Uri: this.state.infoLink.uri,
        },
      };

      if (this.state.infoLink.label) {
        newIssue.InfoLinks.InfoLink.Label = this.state.infoLink.label;
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

  createNewIssue = async () => {
    const count = await this.getNextSituationNumber();

    return {
      CreationTime: this.state.date.toISOString(),
      ParticipantRef: this.props.organization.split(':')[0],
      SituationNumber:
        this.props.organization.split(':')[0] + ':SituationNumber:' + count,
      Source: {
        SourceType: 'directReport',
      },
      Progress: 'open',
      ValidityPeriod: null,
      Severity: 'normal',
      ReportType: this.state.reportType,
      Summary: {
        _attributes: {
          'xml:lang': 'NO',
        },
        _text: this.state.oppsummering,
      },
      Description: {
        _attributes: {
          'xml:lang': 'NO',
        },
        _text: this.state.beskrivelse,
      },
      Advice: {
        _attributes: {
          'xml:lang': 'NO',
        },
        _text: this.state.forslag,
      },
      Affects: [],
    };
  };

  getNextSituationNumber = () => {
    const codespace = this.props.organization.split(':')[0];
    const codespaceDocRef = this.props.firebase.doc(`codespaces/${codespace}`);
    return this.props.firebase.runTransaction(
      this.getNextSituationNumberTransaction(codespaceDocRef)
    );
  };

  getNextSituationNumberTransaction =
    (codespaceDocRef) => async (transaction) => {
      const codespaceDoc = await transaction.get(codespaceDocRef);

      if (!codespaceDoc.exists) {
        await transaction.set(codespaceDocRef, {
          nextSituationNumber: 2,
        });
        return 1;
      } else {
        let nextSituationNumber = codespaceDoc.data().nextSituationNumber;
        await transaction.update(codespaceDocRef, {
          nextSituationNumber: nextSituationNumber + 1,
        });
        return nextSituationNumber;
      }
    };

  handleChangeType = (event) => {
    this.createStops();
    if (this.state.departureSok) {
      this.setState({
        message: undefined,
      });
    }
    this.setState({
      type: event.target.value,
      checkbox: undefined,
      checkbox2: undefined,
      chosenLine: undefined,
      departureSok: undefined,
      submit: undefined,
      departure: undefined,
    });
    if (event.target.value === 'departure') {
      this.setState({
        departure: true,
        dateFromTo: undefined,
        message: undefined,
      });
    }
  };

  handleChangeLine = (event) => {
    if (this.state.type === 'departure') {
      this.setState({
        chosenLine: event.value,
      });
    } else {
      this.setState({
        chosenLine: event.value,
        dateFromTo: true,
        message: true,
        submit: true,
      });
    }
  };

  handleChangeDeparture = (event) => {
    this.setState({
      datedVehicleJourney: event.value,
      message: true,
      submit: true,
    });
  };

  handleChangeSpecifiedStops = (event) => {
    this.setState({
      multipleStops: event,
      dateFromTo: true,
      message: true,
      submit: true,
    });
  };

  handleChangeSpecifyStopsLine = () => {
    const checkBox = document.getElementById('gridCheck');
    if (checkBox.checked === true) {
      this.setState({
        checkbox: true,
      });
    } else {
      this.setState({
        checkbox: undefined,
      });
    }
  };

  handleChangeSpecifyStopsDeparture = () => {
    const checkBox = document.getElementById('gridCheck2');
    if (checkBox.checked === true) {
      this.setState({
        checkbox2: true,
      });
    } else {
      this.setState({
        checkbox2: undefined,
      });
    }
  };

  handleChangeSpecifiedStopsDeparture = (event) => {
    this.setState({ multipleStops: event });
  };

  handleDepartureDateChange = (dObj) => {
    this.setState({
      departureDate: dObj,
      datedVehicleJourney: undefined,
      departures: undefined,
      message: false,
      submit: false,
    });
  };

  callApiDeparture = () => {
    const date = this.state.departureDate;
    const line = this.state.chosenLine;

    this.props.api.getDepartures(line, formatDate(date)).then((response) => {
      this.setState({
        departures: response.data.serviceJourneys,
        departureSok: true,
      });
    });
  };

  returnSpecifiedLines = () => {
    return this.props.lines.find((item) => item.id === this.state.chosenLine);
  };

  returnSpecifiedLinesDeparture = () => {
    return this.state.departures.find(
      (item) => item.id === this.state.datedVehicleJourney
    );
  };

  returnServiceJourney = () => {
    return this.state.departures
      .map((item) => ({
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
        value: item.id,
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
  };

  render() {
    return (
      <div>
        <div className="register_box">
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
                <LinePicker
                  lines={this.props.lines}
                  onChange={this.handleChangeLine}
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
                    <StopPicker
                      isMulti
                      api={this.props.api}
                      stops={this.returnSpecifiedLines().quays}
                      onChange={this.handleChangeSpecifiedStops}
                    />
                    <br></br>
                  </div>
                )}

              {this.state.type === 'stop' && this.state.stops && (
                <div>
                  <StopPicker
                    isMulti
                    api={this.props.api}
                    stops={this.state.stops}
                    onChange={this.handleChangeSpecifiedStops}
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
              <DatePicker
                selectedDate={this.state.departureDate}
                onChange={this.handleDepartureDateChange}
                dateFormat="yyyy-MM-dd"
                minDate={this.state.date}
              />
              <Contrast>
                <Button width="fluid" onClick={this.callApiDeparture}>
                  Søk avganger
                </Button>
              </Contrast>
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
              <StopPicker
                isMulti
                api={this.props.api}
                stops={this.returnSpecifiedLinesDeparture().estimatedCalls.map(
                  ({ quay }) => quay
                )}
                onChange={this.handleChangeSpecifiedStopsDeparture}
              />
              <br></br>
            </div>
          )}

          {this.state.dateFromTo && (
            <div className="bd-highlight justify-content-center">
              <p className="text-center text-white">Gyldighetsperiode</p>
              <div className="form-group d-flex">
                <DatePicker
                  selectedDate={this.state.from}
                  onChange={(from) => this.setState({ from })}
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={this.state.date}
                  showTimeInput
                />
                <DatePicker
                  selectedDate={this.state.to}
                  onChange={(to) => {
                    const now = new Date();
                    if (isBefore(to, now)) {
                      this.setState({ to: now });
                    } else if (isBefore(to, this.state.from)) {
                      this.setState({ to: this.state.from });
                    } else {
                      this.setState({ to });
                    }
                  }}
                  dateFormat="yyyy-MM-dd HH:mm"
                  minDate={this.state.from}
                  showTimeInput
                />
              </div>
            </div>
          )}

          {this.state.message && (
            <div>
              <div className="severity&type">
                <p className="text-center text-white">Avvikstype</p>
                <select
                  className="form-control"
                  name="ReportType"
                  value={this.state.reportType}
                  onChange={(e) =>
                    this.setState({ reportType: e.target.value })
                  }
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
                  value={this.state.oppsummering}
                  onChange={({ target: { value: oppsummering } }) =>
                    this.setState({ oppsummering })
                  }
                />
                <input
                  type="String"
                  name="beskrivelse"
                  className="form-control"
                  placeholder="Eventuell utdypende detaljer om avviket (ikke påkrevd)"
                  value={this.state.beskrivelse}
                  onChange={({ target: { value: beskrivelse } }) =>
                    this.setState({ beskrivelse })
                  }
                />
                <input
                  type="String"
                  name="forslag"
                  className="form-control"
                  placeholder="Beskrivelse om hva kunden skal/kan gjøre (ikke påkrevd)"
                  value={this.state.forslag}
                  onChange={({ target: { value: forslag } }) =>
                    this.setState({ forslag })
                  }
                />
                <br></br>
              </div>
              <div className="message">
                <p className="text-center text-white">
                  Lenke til nettside som har mer informasjon om hendelsen
                </p>
                <input
                  className="form-control"
                  placeholder="Lenke"
                  value={this.state.infoLink?.uri}
                  onChange={(event) =>
                    this.setState({
                      ...this.state,
                      infoLink: {
                        ...this.state.infoLink,
                        uri: event.target.value,
                      },
                    })
                  }
                />
                <input
                  className="form-control"
                  placeholder="Tekst til lenken"
                  value={this.state.infoLink?.label}
                  onChange={(event) =>
                    this.setState({
                      ...this.state,
                      infoLink: {
                        ...this.state.infoLink,
                        label: event.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
          <br></br>
          <div className="submit justify-content-center">
            <Contrast>
              {this.state.submit && (
                <Button onClick={this.handleSubmit}>Registrer</Button>
              )}
              <SecondaryButton onClick={this.handleClick}>
                Tilbake
              </SecondaryButton>
            </Contrast>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
