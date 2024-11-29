import React from 'react';
import Select from 'react-select';
import {
  ButtonGroup,
  PrimaryButton as Button,
  SecondaryButton,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import { DatePicker, Time } from '@entur/datepicker';
import { BannerAlertBox } from '@entur/alert';
import LinePicker from '../common/line-picker';
import StopPicker from '../common/stop-picker';
import { useNavigate } from 'react-router-dom';
import { sortServiceJourneyByDepartureTime } from '../../util/sort';
import {
  getLocalTimeZone,
  now,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
} from '@internationalized/date';

const ConnectedRegisterComponent = (props) => {
  const navigate = useNavigate();

  return <Register {...props} navigate={navigate} />;
};

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
    this.setState({
      date: now(getLocalTimeZone()),
      from: now(getLocalTimeZone()),
      departureDate: now(getLocalTimeZone()),
    });
  }

  createStops = () => {
    const stops = this.props.lines.reduce(
      (acc, line) => [...acc, ...line.quays],
      [],
    );

    this.setState({
      stops,
    });
  };

  createNewLine = () => {
    return {
      networks: {
        affectedNetwork: { affectedLine: { lineRef: this.state.chosenLine } },
      },
    };
  };

  createAffectedRoute = () => {
    return {
      stopPoints: {
        affectedStopPoint: this.state.multipleStops.map((item) => ({
          stopPointRef: item.value,
        })),
      },
    };
  };

  createAffectedRouteLine = () => {
    return {
      affectedStopPoint: this.state.multipleStops.map((item) => ({
        stopPointRef: item.value,
      })),
    };
  };

  createNewSpecifiedStops = () => {
    return {
      networks: {
        affectedNetwork: {
          affectedLine: {
            lineRef: this.state.chosenLine,
            routes: {
              affectedRoute: { stopPoints: this.createAffectedRouteLine() },
            },
          },
        },
      },
    };
  };

  createAffectedDeparture = () => {
    return {
      vehicleJourneys: {
        affectedVehicleJourney: {
          framedVehicleJourneyRef: {
            dataFrameRef: toCalendarDate(this.state.departureDate).toString(),
            datedVehicleJourneyRef: this.state.datedVehicleJourney,
          },
          route: null,
        },
      },
    };
  };

  createNewSpecifiedStopsDeparture = () => {
    return {
      vehicleJourneys: {
        affectedVehicleJourney: {
          framedVehicleJourneyRef: {
            dataFrameRef: toCalendarDate(this.state.departureDate).toString(),
            datedVehicleJourneyRef: this.state.datedVehicleJourney,
          },
          route: this.createAffectedRoute(),
        },
      },
    };
  };

  handleClick = () => {
    this.props.navigate('/');
  };

  handleSubmit = async (event) => {
    const newIssue = this.createNewIssue();

    this.handleEmptyDescription(newIssue);
    this.handleEmptyAdvice(newIssue);
    this.handleValidityPeriod(newIssue);
    this.handleAffects(newIssue);
    this.handleInfoLink(newIssue);

    const codespace = this.props.organization.split(':')[0];
    const authority = this.props.organization;

    await this.props.api.createOrUpdateMessage(codespace, authority, newIssue);
    this.props.navigate('/');
  };

  createNewIssue = () => {
    return {
      creationTime: this.state.date.toAbsoluteString(),
      participantRef: this.props.organization.split(':')[0],
      source: {
        sourceType: 'directReport',
      },
      progress: 'open',
      validityPeriod: null,
      severity: 'normal',
      reportType: this.state.reportType,
      summary: {
        attributes: {
          xmlLang: 'NO',
        },
        text: this.state.oppsummering,
      },
      description: {
        attributes: {
          xmlLang: 'NO',
        },
        text: this.state.beskrivelse,
      },
      advice: {
        attributes: {
          xmlLang: 'NO',
        },
        text: this.state.forslag,
      },
      affects: [],
    };
  };

  handleChangeType = (value) => {
    this.createStops();
    if (this.state.departureSok) {
      this.setState({
        message: undefined,
      });
    }
    this.setState({
      type: value,
      checkbox: undefined,
      checkbox2: undefined,
      chosenLine: undefined,
      departureSok: undefined,
      submit: undefined,
      departure: undefined,
    });
    if (value === 'departure') {
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

    this.props.api
      .getDepartures(line, toCalendarDate(date).toString())
      .then((response) => {
        this.setState({
          departures: structuredClone(response.data.serviceJourneys),
          departureSok: true,
        });
      });
  };

  returnSpecifiedLines = () => {
    return this.props.lines.find((item) => item.id === this.state.chosenLine);
  };

  returnSpecifiedLinesDeparture = () => {
    return this.state.departures.find(
      (item) => item.id === this.state.datedVehicleJourney,
    );
  };

  returnServiceJourney = () => {
    return this.state.departures
      .sort(sortServiceJourneyByDepartureTime)
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
      }));
  };

  onFromChange = (from) => this.setState({ from });

  onToChange = (to) => {
    if (to.compare(now(getLocalTimeZone())) < 0) {
      this.setState({ to: now(getLocalTimeZone()) });
    } else {
      let copy = to.copy();
      if (!copy.hour) {
        copy = toZoned(
          toCalendarDateTime(
            copy,
            new Time(this.state.from.hour, this.state.from.minute),
          ),
          getLocalTimeZone(),
        );
      } else if (!copy.minute) {
        copy = toZoned(
          toCalendarDateTime(
            copy,
            new Time(this.state.to.hour, this.state.from.minute),
          ),
          getLocalTimeZone(),
        );
      }
      this.setState({ to: copy });
    }
  };

  handleAffects(newIssue) {
    if (this.state.type === 'line') {
      if (this.state.checkbox) {
        const newAffect = this.createNewSpecifiedStops();
        newIssue.affects = newAffect;
      } else {
        const newAffect = this.createNewLine();
        newIssue.affects = newAffect;
      }
    }

    if (this.state.type === 'stop') {
      const newAffect = this.createAffectedRoute();
      newIssue.affects = newAffect;
    }
    if (this.state.type === 'departure') {
      if (this.state.checkbox2) {
        const newAffect = this.createNewSpecifiedStopsDeparture();
        newIssue.affects = newAffect;
      } else {
        const newAffect = this.createAffectedDeparture();
        newIssue.affects = newAffect;
      }
    }
  }

  handleValidityPeriod(newIssue) {
    if (this.state.type === 'departure') {
      const from = toZoned(
        toCalendarDateTime(this.state.departureDate, new Time(0, 0, 0, 0)),
        getLocalTimeZone(),
      );
      const to = toZoned(
        toCalendarDateTime(this.state.departureDate, new Time(23, 59, 59, 999)),
        getLocalTimeZone(),
      );
      newIssue.validityPeriod = {
        startTime: from.toAbsoluteString(),
        endTime: to.toAbsoluteString(),
      };
    } else {
      if (this.state.to) {
        newIssue.validityPeriod = {
          startTime: this.state.from.toAbsoluteString(),
          endTime: this.state.to.toAbsoluteString(),
        };
      } else {
        newIssue.validityPeriod = {
          startTime: this.state.from.toAbsoluteString(),
        };
      }
    }
  }

  handleInfoLink(newIssue) {
    if (this.state.infoLink) {
      newIssue.infoLinks = {
        infoLink: {
          uri: this.state.infoLink.uri,
        },
      };

      if (this.state.infoLink.label) {
        newIssue.infoLinks.infoLink.label = this.state.infoLink.label;
      }
    }
  }

  handleEmptyAdvice(newIssue) {
    if (this.state.forslag === '') {
      delete newIssue.advice;
    }
  }

  handleEmptyDescription(newIssue) {
    if (this.state.beskrivelse === '') {
      delete newIssue.description;
    }
  }

  render() {
    return (
      <>
        <h2 className="text-center text-white">Registrer ny melding</h2>
        <br></br>
        <div className="choose_type">
          <p className="text-center text-white">
            Velg linje, stopp eller avgang
          </p>
          <Select
            placeholder=""
            options={[
              {
                label: 'Linje',
                value: 'line',
              },
              {
                label: 'Stopp',
                value: 'stop',
              },
              {
                label: 'Avgang',
                value: 'departure',
              },
            ]}
            onChange={(newValue) => this.handleChangeType(newValue.value)}
          />
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
                    sort
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
                <br></br>
                <BannerAlertBox title="Trå varsomt!" variant="warning">
                  Du er i ferd med å lage en avviksmelding som treffer all
                  rutegående trafikk som passerer de(n) valgte holdeplassen(e)
                  på tvers av operatører. Hvis du ønsker å lage en avviksmelding
                  som kun treffer enkelte linjer (og stopp), velg "Linje" i
                  stedet.
                </BannerAlertBox>
                <br></br>
                <StopPicker
                  sort
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
              label="Dato"
              selectedDate={this.state.departureDate}
              onChange={this.handleDepartureDateChange}
              dateFormats={['yyyy-MM-dd']}
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
                ({ quay }) => quay,
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
                label="Fra"
                selectedDate={this.state.from}
                onChange={this.onFromChange}
                minDate={this.state.date}
                showTime
              />
              <DatePicker
                label="Til"
                selectedDate={this.state.to}
                onChange={this.onToChange}
                minDate={this.state.from}
                showTime
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
                onChange={(e) => this.setState({ reportType: e.target.value })}
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
              <textarea
                name="beskrivelse"
                className="form-control"
                placeholder="Eventuell utdypende detaljer om avviket (ikke påkrevd)"
                value={this.state.beskrivelse}
                onChange={({ target: { value: beskrivelse } }) =>
                  this.setState({ beskrivelse })
                }
                rows={4}
              />
              <textarea
                name="forslag"
                className="form-control"
                placeholder="Beskrivelse om hva kunden skal/kan gjøre (ikke påkrevd)"
                value={this.state.forslag}
                onChange={({ target: { value: forslag } }) =>
                  this.setState({ forslag })
                }
                rows={4}
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
            <ButtonGroup>
              {this.state.submit && (
                <Button onClick={this.handleSubmit}>Registrer</Button>
              )}
              <SecondaryButton onClick={this.handleClick}>
                Tilbake
              </SecondaryButton>
            </ButtonGroup>
          </Contrast>
        </div>
      </>
    );
  }
}

export default ConnectedRegisterComponent;
