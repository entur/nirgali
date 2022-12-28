import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker } from '@entur/datepicker';
import {
  PrimaryButton as Button,
  NegativeButton,
  SecondaryButton,
  ButtonGroup,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import addHours from 'date-fns/addHours';
import Select from 'react-select';
import { isBefore } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { getLineOption } from '../../util/getLineOption';

const Edit = ({ messages, firebase, organization, lines, api }) => {
  const navigate = useNavigate();
  const { id: issueId } = useParams();

  const issue = useMemo(
    () => messages.find(({ id }) => id === issueId),
    [messages, issueId]
  );

  const [serviceJourney, setServiceJourney] = useState(undefined);
  const [from, setFrom] = useState(undefined);
  const [to, setTo] = useState(undefined);

  useEffect(() => {
    const Affects = issue?.data?.Affects;
    const FramedVehicleJourneyRef =
      Affects?.VehicleJourneys?.AffectedVehicleJourney?.FramedVehicleJourneyRef;
    const DatedVehicleJourneyRef =
      FramedVehicleJourneyRef?.DatedVehicleJourneyRef;
    const DataFrameRef = FramedVehicleJourneyRef?.DataFrameRef;

    if (DatedVehicleJourneyRef) {
      api
        .getServiceJourney(DatedVehicleJourneyRef, DataFrameRef)
        .then(({ data }) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [issueId, api, issue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    issue.data.Progress = 'open';
    issue.data.Summary['_text'] = event.target.oppsummering.value;
    if (event.target.beskrivelse.value !== '') {
      issue.data['Description'] = {
        _attributes: { 'xml:lang': 'NO' },
        _text: event.target.beskrivelse.value,
      };
    } else {
      if (issue.data.Description) {
        delete issue.data.Description;
      }
    }
    if (event.target.forslag.value !== '') {
      issue.data['Advice'] = {
        _attributes: { 'xml:lang': 'NO' },
        _text: event.target.forslag.value,
      };
    } else {
      if (issue.data.Advice) {
        delete issue.data.Advice;
      }
    }
    if (from) {
      issue.data.ValidityPeriod.StartTime = from.toISOString();
    }
    if (to) {
      issue.data.ValidityPeriod.EndTime = to.toISOString();
    }
    issue.data.ReportType = event.target.reportType.value;

    if (event.target.infoLinkUri.value !== '') {
      issue.data.InfoLinks = {
        InfoLink: {
          Uri: event.target.infoLinkUri.value,
          Label: event.target.infoLinkLabel.value,
        },
      };
    } else {
      delete issue.data.InfoLinks;
    }

    const codespace = organization.split(':')[0];
    const authority = organization;
    const id = issue.id;

    firebase
      .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
      .set(issue.data)
      .then(() => navigate('/'));
  };

  const handleClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const setProgressToClosed = useCallback(() => {
    const update = {
      Progress: 'closed',
      ValidityPeriod: {
        EndTime: addHours(new Date(), 5).toISOString(),
      },
    };
    const codespace = organization.split(':')[0];
    const authority = organization;
    const id = issue.id;
    firebase
      .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
      .set(update, {
        mergeFields: ['Progress', 'ValidityPeriod.EndTime'],
      })
      .then(() => navigate('/'));
  }, [firebase, issue.id, navigate, organization]);

  const checkStatus = (param) => {
    if (param === 'open') {
      return (
        <Contrast>
          <ButtonGroup>
            <NegativeButton type="button" onClick={setProgressToClosed}>
              Deaktiver
            </NegativeButton>
            <SecondaryButton type="submit">Lagre endringer</SecondaryButton>
          </ButtonGroup>
          <Button onClick={handleClick} type="submit">
            Lukk uten å lagre
          </Button>
        </Contrast>
      );
    } else {
      return (
        <Contrast>
          <ButtonGroup>
            <SecondaryButton>Aktiver</SecondaryButton>
            <Button onClick={handleClick} type="submit">
              Lukk uten å lagre
            </Button>
          </ButtonGroup>
        </Contrast>
      );
    }
  };

  const getReportType = () => {
    return issue.data.ReportType;
  };

  const getSummary = () => {
    return issue.data.Summary['_text'];
  };

  const getDescription = () => {
    if (issue.data.Description) {
      return issue.data.Description['_text'];
    } else {
      return '';
    }
  };

  const getAdvice = () => {
    if (issue.data.Advice) {
      return issue.data.Advice['_text'];
    } else {
      return '';
    }
  };

  const getInfoLinkUri = () => {
    if (issue.data.InfoLinks) {
      return issue.data.InfoLinks.InfoLink.Uri;
    } else {
      return undefined;
    }
  };

  const getInfoLinkLabel = () => {
    if (issue.data.InfoLinks) {
      return issue.data.InfoLinks.InfoLink.Label;
    } else {
      return undefined;
    }
  };

  const returnValue = (type) => {
    switch (type) {
      case 'ReportType':
        return getReportType();
      case 'summary':
        return getSummary();
      case 'description':
        return getDescription();
      case 'advice':
        return getAdvice();
      case 'infoLinkUri':
        return getInfoLinkUri();
      case 'infoLinkLabel':
        return getInfoLinkLabel();
      default:
        return 'error';
    }
  };

  const getType = () => {
    if (issue.data.Affects?.Networks?.AffectedNetwork?.AffectedLine?.LineRef) {
      return 'line';
    } else if (
      issue.data.Affects?.VehicleJourneys?.AffectedVehicleJourney
        ?.FramedVehicleJourneyRef
    ) {
      return 'departure';
    } else if (issue.data.Affects?.StopPoints) {
      return 'stop';
    }

    return '';
  };

  const getLine = () => {
    const Affects = issue.data.Affects;
    const AffectedLine = Affects?.Networks?.AffectedNetwork?.AffectedLine;
    const LineRef = AffectedLine?.LineRef;
    return getLineOption(lines, LineRef);
  };

  const getLineDepartureOption = () => {
    const estimatedCall = serviceJourney.estimatedCalls[0];
    const quayName = estimatedCall.quay.name;
    const aimedDepartureTime = estimatedCall.aimedDepartureTime
      .split('T')
      .pop()
      .split(':00+')[0];

    return {
      value: quayName,
      label: `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`,
    };
  };

  const getLineQuays = () => {
    const Affects = issue.data.Affects;
    const AffectedLine = Affects?.Networks?.AffectedNetwork?.AffectedLine;
    const LineRef = AffectedLine?.LineRef;
    const line = lines.find((l) => l.id === LineRef);
    const StopPoints = AffectedLine?.Routes?.AffectedRoute?.StopPoints;
    return getQuayOptions(StopPoints, line?.quays);
  };

  const getDepartureQuays = () => {
    const Affects = issue.data.Affects;
    const Route = Affects?.VehicleJourneys?.AffectedVehicleJourney?.Route;
    const StopPoints = Route?.StopPoints;
    const lineId = serviceJourney.line.id;
    const line = lines.find((l) => l.id === lineId);
    return getQuayOptions(StopPoints, line.quays);
  };

  const getStopQuays = () => {
    const Affects = issue.data.Affects;
    const StopPoints = Affects?.StopPoints;
    const quays = lines.reduce((acc, line) => [...acc, ...line.quays], []);
    return getQuayOptions(StopPoints, quays);
  };

  const getQuayOptions = (StopPoints, quays) => {
    return quays
      ? StopPoints?.AffectedStopPoint?.map((AffectedStopPoint) => {
          return quays.find(
            (q) =>
              q.stopPlace && q.stopPlace.id === AffectedStopPoint.StopPointRef
          );
        })
          ?.filter((v) => v !== undefined)
          ?.map(({ id, name }) => ({
            value: id,
            label: `${name} - ${id}`,
          }))
      : [
          {
            label: 'Ukjent stoppested',
          },
        ];
  };

  const onFromChange = useCallback((from) => setFrom(from), [setFrom]);

  const onToChange = useCallback(
    (to) => {
      const now = new Date();
      const calculatedFrom =
        from || new Date(issue.data.ValidityPeriod.StartTime);

      if (isBefore(to, now)) {
        setTo(now);
      } else if (isBefore(to, calculatedFrom)) {
        setTo(calculatedFrom);
      } else {
        setTo(to);
      }
    },
    [setTo, from, issue]
  );

  if (!issue || !lines?.length) {
    return null;
  }

  return (
    <>
      <form className="register" onSubmit={handleSubmit} autoComplete="off">
        <br></br>
        <h2 className="text-center text-white">Endre avvik</h2>
        <br></br>
        {getType() === 'line' && (
          <>
            <p className="text-center text-white">Linje</p>
            <div className="choose_type">
              <Select value={getLine()} options={[getLine()]} />
            </div>
            {getLineQuays() && (
              <>
                <br></br>
                <div>
                  <Select
                    isMulti
                    value={getLineQuays()}
                    options={getLineQuays()}
                  />
                  <br></br>
                </div>
              </>
            )}
          </>
        )}

        {getType() === 'departure' && (
          <>
            <p className="text-center text-white">Avgang</p>

            {serviceJourney && (
              <>
                <div className="choose_type">
                  <Select
                    value={getLineOption(lines, serviceJourney.line.id)}
                    options={[getLineOption(lines, serviceJourney.line.id)]}
                  />
                </div>
                <div className="choose_type">
                  <Select
                    value={getLineDepartureOption()}
                    options={[getLineDepartureOption()]}
                  />
                </div>
                {getDepartureQuays() && (
                  <Select
                    isMulti
                    value={getDepartureQuays()}
                    options={[getDepartureQuays()]}
                  />
                )}
              </>
            )}
          </>
        )}

        {getType() === 'stop' && (
          <>
            <p className="text-center text-white">Stopp</p>
            {getStopQuays() && (
              <Select
                isMulti
                value={getStopQuays()}
                options={[getStopQuays()]}
              />
            )}
          </>
        )}

        <br></br>

        <p className="text-center text-white">Gyldighetsperiode</p>
        <div className="form-group d-flex">
          <DatePicker
            label="Fra"
            selectedDate={from || new Date(issue.data.ValidityPeriod.StartTime)}
            onChange={onFromChange}
            dateFormats={['yyyy-MM-dd HH:mm']}
            minDate={new Date()}
            showTimeInput
          />
          <DatePicker
            label="Til"
            selectedDate={
              to ||
              (issue.data.ValidityPeriod.EndTime
                ? new Date(issue.data.ValidityPeriod.EndTime)
                : undefined)
            }
            onChange={onToChange}
            dateFormats={['yyyy-MM-dd HH:mm']}
            minDate={from}
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
            defaultValue={returnValue('ReportType')}
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
          defaultValue={returnValue('summary')}
          maxLength="160"
          required
        />
        <input
          type="String"
          name="beskrivelse"
          className="form-control"
          defaultValue={returnValue('description')}
        />
        <input
          type="String"
          name="forslag"
          className="form-control"
          defaultValue={returnValue('advice')}
        />
        <br></br>
        <p className="text-center text-white">
          Lenke til nettside som har mer informasjon om hendelsen
        </p>
        <input
          className="form-control"
          name="infoLinkUri"
          placeholder="Lenke"
          defaultValue={returnValue('infoLinkUri')}
        />
        <input
          className="form-control"
          name="infoLinkLabel"
          placeholder="Tekst til lenken"
          defaultValue={returnValue('infoLinkLabel')}
        />
        <br></br>
        {checkStatus(issue.data.Progress)}
      </form>
    </>
  );
};

export default Edit;
