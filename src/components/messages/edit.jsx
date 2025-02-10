import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, Time } from '@entur/datepicker';
import {
  ButtonGroup,
  NegativeButton,
  PrimaryButton as Button,
  SecondaryButton,
} from '@entur/button';
import { Contrast } from '@entur/layout';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { getLineOption } from '../../util/getLineOption';
import {
  getLocalTimeZone,
  now,
  parseAbsoluteToLocal,
  toCalendarDateTime,
  toZoned,
} from '@internationalized/date';

const Edit = ({ messages, organization, lines, api }) => {
  const navigate = useNavigate();
  const { id: issueId } = useParams();

  const issue = useMemo(
    () => messages.find(({ id }) => id === issueId),
    [messages, issueId],
  );

  const [serviceJourney, setServiceJourney] = useState(undefined);
  const [from, setFrom] = useState(
    parseAbsoluteToLocal(issue?.validityPeriod.startTime),
  );
  const [to, setTo] = useState(undefined);

  useEffect(() => {
    const affects = issue?.affects;
    const framedVehicleJourneyRef =
      affects?.vehicleJourneys?.affectedVehicleJourney?.framedVehicleJourneyRef;
    const datedVehicleJourneyRef =
      framedVehicleJourneyRef?.datedVehicleJourneyRef;
    const dataFrameRef = framedVehicleJourneyRef?.dataFrameRef;

    if (datedVehicleJourneyRef) {
      api
        .getServiceJourney(datedVehicleJourneyRef, dataFrameRef)
        .then(({ data }) => {
          setServiceJourney(data.serviceJourney);
        });
    }
  }, [issueId, api, issue]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (issue.validityPeriod.endTime) {
      const calculatedTo =
        to || parseAbsoluteToLocal(issue.validityPeriod.endTime);

      if (calculatedTo.compare(now(getLocalTimeZone())) < 0) {
        // show alert banner, to must be after now
        return;
      }
    }

    const newIssue = Object.assign({}, issue);

    newIssue.progress = 'open';
    newIssue.summary = {
      attributes: {
        xmlLang: 'NO',
      },
      text: event.target.oppsummering.value,
    };

    if (event.target.beskrivelse.value !== '') {
      newIssue.description = {
        attributes: {
          xmlLang: 'NO',
        },
        text: event.target.beskrivelse.value,
      };
    } else {
      if (newIssue.description) {
        delete newIssue.description;
      }
    }
    if (event.target.forslag.value !== '') {
      newIssue.advice = {
        attributes: {
          xmlLang: 'NO',
        },
        text: event.target.forslag.value,
      };
    } else {
      if (newIssue.advice) {
        delete newIssue.advice;
      }
    }
    if (from) {
      newIssue.validityPeriod.startTime = from.toAbsoluteString();
    }
    if (to) {
      newIssue.validityPeriod.endTime = to.toAbsoluteString();
    }
    newIssue.reportType = event.target.reportType.value;

    if (event.target.infoLinkUri.value !== '') {
      newIssue.infoLinks = {
        infoLink: {
          uri: event.target.infoLinkUri.value,
          label: event.target.infoLinkLabel.value,
        },
      };
    } else {
      delete newIssue.infoLinks;
    }

    api
      .createOrUpdateMessage(organization.split(':')[0], organization, newIssue)
      .then(() => navigate('/'));
  };

  const handleClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const setProgressToClosed = useCallback(() => {
    const update = Object.assign({}, issue, {
      progress: 'closed',
      validityPeriod: {
        startTime: issue.validityPeriod.startTime,
        endTime: now(getLocalTimeZone()).add({ hours: 5 }).toAbsoluteString(),
      },
    });

    api
      .createOrUpdateMessage(organization.split(':')[0], organization, update)
      .then(() => navigate('/'));
  }, [issue, navigate, organization, api]);

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
    return issue.reportType;
  };

  const getSummary = () => {
    return issue.summary.text;
  };

  const getDescription = () => {
    if (issue.description) {
      return issue.description.text;
    } else {
      return '';
    }
  };

  const getAdvice = () => {
    if (issue.advice) {
      return issue.advice.text;
    } else {
      return '';
    }
  };

  const getInfoLinkUri = () => {
    if (issue.infoLinks) {
      return issue.infoLinks.infoLink.uri;
    } else {
      return undefined;
    }
  };

  const getInfoLinkLabel = () => {
    if (issue.infoLinks) {
      return issue.infoLinks.infoLink.label;
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
    if (issue.affects?.networks?.affectedNetwork?.affectedLine?.lineRef) {
      return 'line';
    } else if (
      issue.affects?.vehicleJourneys?.affectedVehicleJourney
        ?.framedVehicleJourneyRef
    ) {
      return 'departure';
    } else if (issue.affects?.stopPoints) {
      return 'stop';
    }

    return '';
  };

  const getLine = () => {
    const affects = issue.affects;
    const affectedLine = affects?.networks?.affectedNetwork?.affectedLine;
    const lineRef = affectedLine?.lineRef;
    return getLineOption(lines, lineRef);
  };

  const getLineDepartureOption = () => {
    if (serviceJourney.estimatedCalls.length === 0) {
      return null;
    }
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
    const affects = issue.affects;
    const affectedLine = affects?.networks?.affectedNetwork?.affectedLine;
    const lineRef = affectedLine?.lineRef;
    const line = lines.find((l) => l.id === lineRef);
    const stopPoints = affectedLine?.routes?.affectedRoute?.stopPoints;
    return getQuayOptions(stopPoints, line?.quays);
  };

  const getDepartureQuays = () => {
    const affects = issue.affects;
    const route = affects?.vehicleJourneys?.affectedVehicleJourney?.route;
    const stopPoints = route?.stopPoints;
    const lineId = serviceJourney.line.id;
    const line = lines.find((l) => l.id === lineId);
    return getQuayOptions(stopPoints, line.quays);
  };

  const getStopQuays = () => {
    const affects = issue.affects;
    const stopPoints = affects?.stopPoints;
    const quays = lines.reduce((acc, line) => [...acc, ...line.quays], []);
    return getQuayOptions(stopPoints, quays);
  };

  const getQuayOptions = (stopPoints, quays) => {
    return quays
      ? stopPoints?.affectedStopPoint
          ?.map((affectedStopPoint) => {
            return quays.find(
              (q) =>
                q.stopPlace &&
                q.stopPlace.id === affectedStopPoint.stopPointRef,
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
      setTo(to);
    },
    [setTo, from, issue],
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
                  {getLineDepartureOption() && (
                    <Select
                      value={getLineDepartureOption()}
                      options={[getLineDepartureOption()]}
                    />
                  )}
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
            selectedDate={
              from || parseAbsoluteToLocal(issue.validityPeriod.startTime)
            }
            onChange={onFromChange}
            minDate={
              parseAbsoluteToLocal(issue.validityPeriod.startTime).compare(
                now(getLocalTimeZone()),
              ) < 0
                ? undefined
                : now(getLocalTimeZone())
            }
            showTime
            disabled={
              parseAbsoluteToLocal(issue.validityPeriod.startTime).compare(
                now(getLocalTimeZone()),
              ) < 0
            }
          />
          <DatePicker
            label="Til"
            selectedDate={
              to ||
              (issue.validityPeriod.endTime
                ? parseAbsoluteToLocal(issue.validityPeriod.endTime)
                : undefined)
            }
            onChange={onToChange}
            minDate={
              from.compare(now(getLocalTimeZone())) > 0
                ? from
                : now(getLocalTimeZone())
            }
            showTime
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
        <textarea
          name="beskrivelse"
          className="form-control"
          defaultValue={returnValue('description')}
          rows={4}
        />
        <textarea
          name="forslag"
          className="form-control"
          defaultValue={returnValue('advice')}
          rows={4}
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
        {checkStatus(issue.progress)}
      </form>
    </>
  );
};

export default Edit;
