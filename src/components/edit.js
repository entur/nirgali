import React from 'react';
import { DatePicker } from '@entur/datepicker';
import {
  PrimaryButton as Button,
  NegativeButton,
  SecondaryButton
} from '@entur/button';
import { ButtonGroup } from '@entur/button';
import { Contrast } from '@entur/layout';
import addHours from 'date-fns/addHours';
import Select from 'react-select';
import { isBefore } from 'date-fns';

class Edit extends React.Component {
  state = {
    serviceJourney: undefined,
    from: undefined,
    to: undefined
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps?.issue?.id !== this.props?.issue?.id ||
      !this.state.serviceJourney
    ) {
      this.getDepartureLine();
    }
  }

  componentDidMount() {
    this.getDepartureLine();
  }

  handleSubmit = event => {
    event.preventDefault();
    this.props.issue.data.Progress = 'open';
    this.props.issue.data.Summary['_text'] = event.target.oppsummering.value;
    if (event.target.beskrivelse.value !== '') {
      this.props.issue.data['Description'] = {
        _attributes: { 'xml:lang': 'NO' },
        _text: event.target.beskrivelse.value
      };
    } else {
      if (this.props.issue.data.Description) {
        delete this.props.issue.data.Description;
      }
    }
    if (event.target.forslag.value !== '') {
      this.props.issue.data['Advice'] = {
        _attributes: { 'xml:lang': 'NO' },
        _text: event.target.forslag.value
      };
    } else {
      if (this.props.issue.data.Advice) {
        delete this.props.issue.data.Advice;
      }
    }
    if (this.state.from) {
      this.props.issue.data.ValidityPeriod.StartTime = this.state.from.toISOString();
    }
    if (this.state.to) {
      this.props.issue.data.ValidityPeriod.EndTime = this.state.to.toISOString();
    }
    this.props.issue.data.ReportType = event.target.reportType.value;

    if (event.target.infoLinkUri.value !== '') {
      this.props.issue.data.InfoLinks = {
        InfoLink: {
          Uri: event.target.infoLinkUri.value,
          Label: event.target.infoLinkLabel.value
        }
      };
    } else {
      delete this.props.issue.data.InfoLinks;
    }

    const codespace = this.props.organization.split(':')[0];
    const authority = this.props.organization;
    const id = this.props.issue.id;

    this.props.firebase
      .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
      .set(this.props.issue.data)
      .then(() => this.props.history.push('/'));
  };

  handleClick = () => {
    this.props.history.push('/');
  };

  setProgressToClosed = () => {
    const update = {
      Progress: 'closed',
      ValidityPeriod: {
        EndTime: addHours(new Date(), 5).toISOString()
      }
    };
    const codespace = this.props.organization.split(':')[0];
    const authority = this.props.organization;
    const id = this.props.issue.id;
    this.props.firebase
      .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
      .set(update, {
        mergeFields: ['Progress', 'ValidityPeriod.EndTime']
      })
      .then(() => this.props.history.push('/'));
  };

  checkStatus = param => {
    if (param === 'open') {
      return (
        <Contrast>
          <ButtonGroup>
            <NegativeButton type="button" onClick={this.setProgressToClosed}>
              Deaktiver
            </NegativeButton>
            <SecondaryButton type="submit">Lagre endringer</SecondaryButton>
          </ButtonGroup>
          <Button onClick={this.handleClick} type="submit">
            Lukk uten å lagre
          </Button>
        </Contrast>
      );
    } else {
      return (
        <Contrast>
          <ButtonGroup>
            <SecondaryButton>Aktiver</SecondaryButton>
            <Button onClick={this.handleClick} type="submit">
              Lukk uten å lagre
            </Button>
          </ButtonGroup>
        </Contrast>
      );
    }
  };

  returnValue = type => {
    let issue = this.props.issue.data;

    if (type === 'ReportType') {
      return issue.ReportType;
    }
    if (type === 'summary') {
      return issue.Summary['_text'];
    }
    if (type === 'description') {
      if (issue.Description) {
        return issue.Description['_text'];
      } else {
        return '';
      }
    }
    if (type === 'advice') {
      if (issue.Advice) {
        return issue.Advice['_text'];
      } else {
        return '';
      }
    }

    if (type === 'infoLinkUri') {
      if (issue.InfoLinks) {
        return issue.InfoLinks.InfoLink.Uri;
      } else {
        return undefined;
      }
    }

    if (type === 'infoLinkLabel') {
      if (issue.InfoLinks) {
        return issue.InfoLinks.InfoLink.Label;
      } else {
        return undefined;
      }
    }

    return 'error';
  };

  getType = () => {
    if (
      this.props.issue.data.Affects?.Networks?.AffectedNetwork?.AffectedLine
        ?.LineRef
    ) {
      return 'line';
    } else if (
      this.props.issue.data.Affects?.VehicleJourneys?.AffectedVehicleJourney
        ?.FramedVehicleJourneyRef
    ) {
      return 'departure';
    } else if (this.props.issue.data.Affects?.StopPoints) {
      return 'stop';
    }

    return '';
  };

  getLine = () => {
    const Affects = this.props.issue.data.Affects;
    const AffectedLine = Affects?.Networks?.AffectedNetwork?.AffectedLine;
    const LineRef = AffectedLine?.LineRef;
    return this.getLineOption(LineRef);
  };

  getLineOption = id => {
    const line = this.props.lines.find(l => l.id === id);
    return {
      value: line.id,
      label: `${line.name} (${line.publicCode}) - ${line.id}`
    };
  };

  getLineDepartureOption = () => {
    const serviceJourney = this.state.serviceJourney;
    const estimatedCall = serviceJourney.estimatedCalls[0];
    const quayName = estimatedCall.quay.name;
    const aimedDepartureTime = estimatedCall.aimedDepartureTime
      .split('T')
      .pop()
      .split(':00+')[0];

    return {
      value: quayName,
      label: `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`
    };
  };

  getLineQuays = () => {
    const Affects = this.props.issue.data.Affects;
    const AffectedLine = Affects?.Networks?.AffectedNetwork?.AffectedLine;
    const LineRef = AffectedLine?.LineRef;
    const line = this.props.lines.find(l => l.id === LineRef);
    const StopPoints = AffectedLine?.Routes?.AffectedRoute?.StopPoints;
    return this.getQuayOptions(StopPoints, line.quays);
  };

  getDepartureLine = () => {
    const Affects = this.props.issue?.data?.Affects;
    const FramedVehicleJourneyRef =
      Affects?.VehicleJourneys?.AffectedVehicleJourney?.FramedVehicleJourneyRef;
    const DatedVehicleJourneyRef =
      FramedVehicleJourneyRef?.DatedVehicleJourneyRef;
    const DataFrameRef = FramedVehicleJourneyRef?.DataFrameRef;

    if (DatedVehicleJourneyRef) {
      this.props.api
        .getServiceJourney(DatedVehicleJourneyRef, DataFrameRef)
        .then(({ data }) => {
          this.setState({ serviceJourney: data.serviceJourney });
        });
    }
  };

  getDepartureQuays = () => {
    const Affects = this.props.issue.data.Affects;
    const Route = Affects?.VehicleJourneys?.AffectedVehicleJourney?.Route;
    const StopPoints = Route?.StopPoints;
    const lineId = this.state.serviceJourney.line.id;
    const line = this.props.lines.find(l => l.id === lineId);
    return this.getQuayOptions(StopPoints, line.quays);
  };

  getStopQuays = () => {
    const Affects = this.props.issue.data.Affects;
    const StopPoints = Affects?.StopPoints;
    const quays = this.props.lines.reduce(
      (acc, line) => (acc = acc.concat(line.quays)),
      []
    );
    return this.getQuayOptions(StopPoints, quays);
  };

  getQuayOptions = (StopPoints, quays) => {
    return StopPoints?.AffectedStopPoint?.map(AffectedStopPoint => {
      return quays.find(
        q => q.stopPlace && q.stopPlace.id === AffectedStopPoint.StopPointRef
      );
    })?.map(({ id, name }) => ({
      value: id,
      label: `${name} - ${id}`
    }));
  };

  render() {
    if (!this.props.issue || !this.props.lines?.length) {
      return null;
    }

    return (
      <div>
        <div className="register_box">
          <form
            className="register"
            onSubmit={this.handleSubmit}
            autoComplete="off"
          >
            <br></br>
            <h2 className="text-center text-white">Endre avvik</h2>
            <br></br>
            {this.getType() === 'line' && (
              <>
                <p className="text-center text-white">Linje</p>
                <div className="choose_type">
                  <Select value={this.getLine()} options={[this.getLine()]} />
                </div>
                {this.getLineQuays() && (
                  <>
                    <br></br>
                    <div>
                      <Select
                        isMulti
                        value={this.getLineQuays()}
                        options={this.getLineQuays()}
                      />
                      <br></br>
                    </div>
                  </>
                )}
              </>
            )}

            {this.getType() === 'departure' && (
              <>
                <p className="text-center text-white">Avgang</p>

                {this.state.serviceJourney && (
                  <>
                    <div className="choose_type">
                      <Select
                        value={this.getLineOption(
                          this.state.serviceJourney.line.id
                        )}
                        options={[
                          this.getLineOption(this.state.serviceJourney.line.id)
                        ]}
                      />
                    </div>
                    <div className="choose_type">
                      <Select
                        value={this.getLineDepartureOption()}
                        options={[this.getLineDepartureOption()]}
                      />
                    </div>
                    {this.getDepartureQuays() && (
                      <Select
                        isMulti
                        value={this.getDepartureQuays()}
                        options={[this.getDepartureQuays()]}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {this.getType() === 'stop' && (
              <>
                <p className="text-center text-white">Stopp</p>
                {this.getStopQuays() && (
                  <Select
                    isMulti
                    value={this.getStopQuays()}
                    options={[this.getStopQuays()]}
                  />
                )}
              </>
            )}

            <br></br>

            <p className="text-center text-white">Gyldighetsperiode</p>
            <div className="form-group d-flex">
              <DatePicker
                selectedDate={
                  this.state.from ||
                  new Date(this.props.issue.data.ValidityPeriod.StartTime)
                }
                onChange={from => this.setState({ from })}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={new Date()}
                showTimeInput
              />
              <DatePicker
                selectedDate={
                  this.state.to ||
                  (this.props.issue.data.ValidityPeriod.EndTime
                    ? new Date(this.props.issue.data.ValidityPeriod.EndTime)
                    : undefined)
                }
                onChange={to => {
                  const now = new Date();
                  const from =
                    this.state.from ||
                    new Date(this.props.issue.data.ValidityPeriod.StartTime);

                  if (isBefore(to, now)) {
                    this.setState({ to: now });
                  } else if (isBefore(to, from)) {
                    this.setState({ to: from });
                  } else {
                    this.setState({ to });
                  }
                }}
                dateFormat="yyyy-MM-dd HH:mm"
                minDate={this.state.from}
                showTimeInput
                placeholder="Til-dato"
              />
            </div>
            <br></br>
            <div className="severity">
              <p className="text-center text-white">Avvikstype</p>
              <select
                className="form-control"
                id="cssmenu"
                defaultValue={this.returnValue('ReportType')}
                name="reportType"
              >
                <option value="general">General</option>
                <option value="incident">Incident</option>
              </select>
              <br></br>
            </div>
            <p className="text-center text-white">Melding</p>
            <input
              type="String"
              name="oppsummering"
              className="form-control"
              defaultValue={this.returnValue('summary')}
              maxLength="160"
              required
            />
            <input
              type="String"
              name="beskrivelse"
              className="form-control"
              defaultValue={this.returnValue('description')}
            />
            <input
              type="String"
              name="forslag"
              className="form-control"
              defaultValue={this.returnValue('advice')}
            />
            <br></br>
            <p className="text-center text-white">
              Lenke til nettside som har mer informasjon om hendelsen
            </p>
            <input
              className="form-control"
              name="infoLinkUri"
              placeholder="Lenke"
              defaultValue={this.returnValue('infoLinkUri')}
            />
            <input
              className="form-control"
              name="infoLinkLabel"
              placeholder="Tekst til lenken"
              defaultValue={this.returnValue('infoLinkLabel')}
            />
            <br></br>
            {this.checkStatus(this.props.issue.data.Progress)}
          </form>
        </div>
      </div>
    );
  }
}

export default Edit;
