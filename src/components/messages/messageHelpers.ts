import {
  fromDate,
  getLocalTimeZone,
  now,
  Time,
  toCalendarDate,
  toCalendarDateTime,
  toZoned,
} from '@internationalized/date';
import { AffectType } from './types';

export const createNewIssue = (
  organization: string,
  date: any,
  reportType: string,
  oppsummering: string,
  beskrivelse: string,
  forslag: string,
) => {
  const issue: any = {
    creationTime: date.toAbsoluteString(),
    participantRef: organization.split(':')[0],
    source: { sourceType: 'directReport' },
    progress: 'open',
    validityPeriod: null,
    severity: 'normal',
    reportType,
    summary: { attributes: { xmlLang: 'NO' }, text: oppsummering },
    affects: [],
  };

  if (beskrivelse !== '') {
    issue.description = { attributes: { xmlLang: 'NO' }, text: beskrivelse };
  }

  if (forslag !== '') {
    issue.advice = { attributes: { xmlLang: 'NO' }, text: forslag };
  }

  return issue;
};

export const createAffectsLine = (lineRef: string) => ({
  networks: {
    affectedNetwork: { affectedLine: { lineRef } },
  },
});

export const createAffectsLineWithStops = (
  lineRef: string,
  stops: { value: string }[],
) => ({
  networks: {
    affectedNetwork: {
      affectedLine: {
        lineRef,
        routes: {
          affectedRoute: {
            stopPoints: {
              affectedStopPoint: stops.map((s) => ({
                stopPointRef: s.value,
              })),
            },
          },
        },
      },
    },
  },
});

export const createAffectsStop = (stops: { value: string }[]) => ({
  stopPoints: {
    affectedStopPoint: stops.map((s) => ({ stopPointRef: s.value })),
  },
});

export const createAffectsDeparture = (
  departureDate: Date,
  datedVehicleJourney: string,
) => {
  const zonedDate = fromDate(departureDate, getLocalTimeZone());
  return {
    vehicleJourneys: {
      affectedVehicleJourney: {
        framedVehicleJourneyRef: {
          dataFrameRef: toCalendarDate(zonedDate).toString(),
          datedVehicleJourneyRef: datedVehicleJourney,
        },
        route: null,
      },
    },
  };
};

export const createAffectsDepartureWithStops = (
  departureDate: Date,
  datedVehicleJourney: string,
  stops: { value: string }[],
) => {
  const zonedDate = fromDate(departureDate, getLocalTimeZone());
  return {
    vehicleJourneys: {
      affectedVehicleJourney: {
        framedVehicleJourneyRef: {
          dataFrameRef: toCalendarDate(zonedDate).toString(),
          datedVehicleJourneyRef: datedVehicleJourney,
        },
        route: {
          stopPoints: {
            affectedStopPoint: stops.map((s) => ({
              stopPointRef: s.value,
            })),
          },
        },
      },
    },
  };
};

export const buildAffects = (
  type: AffectType | undefined,
  chosenLine: string | undefined,
  specifyStopsLine: boolean,
  specifyStopsDeparture: boolean,
  multipleStops: { value: string }[],
  departureDate: any,
  datedVehicleJourney: string | undefined,
) => {
  if (type === 'line' && chosenLine) {
    return specifyStopsLine
      ? createAffectsLineWithStops(chosenLine, multipleStops)
      : createAffectsLine(chosenLine);
  }
  if (type === 'stop') {
    return createAffectsStop(multipleStops);
  }
  if (type === 'departure' && datedVehicleJourney) {
    return specifyStopsDeparture
      ? createAffectsDepartureWithStops(
          departureDate,
          datedVehicleJourney,
          multipleStops,
        )
      : createAffectsDeparture(departureDate, datedVehicleJourney);
  }
  return [];
};

export const buildValidityPeriod = (
  type: AffectType | undefined,
  departureDate: any,
  from: any,
  to: any,
) => {
  if (type === 'departure') {
    const calendarDate = toCalendarDate(
      fromDate(departureDate, getLocalTimeZone()),
    );
    const start = toZoned(
      toCalendarDateTime(calendarDate, new Time(0, 0, 0, 0)),
      getLocalTimeZone(),
    );
    const end = toZoned(
      toCalendarDateTime(calendarDate, new Time(23, 59, 59, 999)),
      getLocalTimeZone(),
    );
    return {
      startTime: start.toAbsoluteString(),
      endTime: end.toAbsoluteString(),
    };
  }

  if (to) {
    return {
      startTime: from.toAbsoluteString(),
      endTime: to.toAbsoluteString(),
    };
  }

  return { startTime: from.toAbsoluteString() };
};

export const addInfoLink = (
  issue: any,
  infoLink: { uri: string; label?: string } | undefined,
) => {
  if (infoLink?.uri) {
    issue.infoLinks = {
      infoLink: {
        uri: infoLink.uri,
        ...(infoLink.label ? { label: infoLink.label } : {}),
      },
    };
  }
};

export const getMessageType = (affects: any): string => {
  if (!affects) return 'Error';
  if (affects.networks !== null && affects.networks !== undefined)
    return 'Linje';
  if (affects.stopPoints !== null && affects.stopPoints !== undefined)
    return 'Stopp';
  if (affects.vehicleJourneys !== null && affects.vehicleJourneys !== undefined)
    return 'Avgang';
  return 'Error';
};

export const getAffectType = (
  affects: any,
): 'line' | 'departure' | 'stop' | '' => {
  if (affects?.networks?.affectedNetwork?.affectedLine?.lineRef) return 'line';
  if (affects?.vehicleJourneys?.affectedVehicleJourney?.framedVehicleJourneyRef)
    return 'departure';
  if (affects?.stopPoints) return 'stop';
  return '';
};

export const getLineQuayLabels = (affects: any, lines: any[]): string[] => {
  const affectedLine = affects?.networks?.affectedNetwork?.affectedLine;
  const stopPoints =
    affectedLine?.routes?.affectedRoute?.stopPoints?.affectedStopPoint;
  if (!stopPoints) return [];
  return stopPoints
    .map((sp: any) => {
      const line = lines?.find((l: any) => l.id === affectedLine.lineRef);
      const quay = line?.quays?.find(
        (q: any) => q.stopPlace?.id === sp.stopPointRef,
      );
      return quay ? `${quay.name} - ${quay.stopPlace.id}` : null;
    })
    .filter(Boolean) as string[];
};

export const getStopQuayLabels = (affects: any, lines: any[]): string[] => {
  const stopPoints = affects?.stopPoints?.affectedStopPoint;
  if (!stopPoints) return [];
  const quays = lines?.reduce(
    (acc: any[], line: any) => [...acc, ...line.quays],
    [],
  );
  return stopPoints
    .map((sp: any) => {
      const quay = quays?.find((q: any) => q.stopPlace?.id === sp.stopPointRef);
      return quay ? `${quay.name} - ${quay.stopPlace.id}` : null;
    })
    .filter(Boolean) as string[];
};

export const buildUpdatedIssue = (
  issue: any,
  fields: {
    summary: string;
    description: string;
    advice: string;
    from: Date | null;
    to: Date | null;
    reportType: string;
    infoLinkUri: string;
    infoLinkLabel: string;
  },
): any => {
  const newIssue = { ...issue };
  newIssue.progress = 'open';
  newIssue.summary = { attributes: { xmlLang: 'NO' }, text: fields.summary };

  if (fields.description) {
    newIssue.description = {
      attributes: { xmlLang: 'NO' },
      text: fields.description,
    };
  } else {
    delete newIssue.description;
  }

  if (fields.advice) {
    newIssue.advice = { attributes: { xmlLang: 'NO' }, text: fields.advice };
  } else {
    delete newIssue.advice;
  }

  if (fields.from) {
    newIssue.validityPeriod = {
      ...newIssue.validityPeriod,
      startTime: fields.from.toISOString(),
    };
  }
  if (fields.to) {
    newIssue.validityPeriod = {
      ...newIssue.validityPeriod,
      endTime: fields.to.toISOString(),
    };
  }

  newIssue.reportType = fields.reportType;

  if (fields.infoLinkUri) {
    newIssue.infoLinks = {
      infoLink: {
        uri: fields.infoLinkUri,
        label: fields.infoLinkLabel || undefined,
      },
    };
  } else {
    delete newIssue.infoLinks;
  }

  return newIssue;
};
