import {
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
  departureDate: any,
  datedVehicleJourney: string,
) => ({
  vehicleJourneys: {
    affectedVehicleJourney: {
      framedVehicleJourneyRef: {
        dataFrameRef: toCalendarDate(departureDate).toString(),
        datedVehicleJourneyRef: datedVehicleJourney,
      },
      route: null,
    },
  },
});

export const createAffectsDepartureWithStops = (
  departureDate: any,
  datedVehicleJourney: string,
  stops: { value: string }[],
) => ({
  vehicleJourneys: {
    affectedVehicleJourney: {
      framedVehicleJourneyRef: {
        dataFrameRef: toCalendarDate(departureDate).toString(),
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
});

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
    const start = toZoned(
      toCalendarDateTime(departureDate, new Time(0, 0, 0, 0)),
      getLocalTimeZone(),
    );
    const end = toZoned(
      toCalendarDateTime(departureDate, new Time(23, 59, 59, 999)),
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
