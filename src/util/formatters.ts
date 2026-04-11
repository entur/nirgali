import { DateFormatter, getLocalTimeZone, now } from '@internationalized/date';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export const isJourneyActive = (
  expiresAtEpochMs: number,
  cancellation?: boolean,
): boolean =>
  !cancellation &&
  expiresAtEpochMs >
    now(getLocalTimeZone()).add({ minutes: 10 }).toDate().getTime();

export const isMessageExpired = (
  endTime: string | undefined,
  progress: string,
  currentTime: number,
): boolean =>
  (!!endTime && Date.parse(endTime) < currentTime) || progress === 'closed';

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Ikke oppgitt';
  const formatter = new DateFormatter('nb-NO');
  return formatter.format(new Date(dateStr));
};

export const formatDepartureOption = (serviceJourney: any): string | null => {
  const estimatedCall = serviceJourney?.estimatedCalls?.[0];
  if (!estimatedCall?.quay) {
    return `Avgangsinformasjon utilgjengelig (${serviceJourney?.id || 'ukjent'})`;
  }
  const quayName = estimatedCall.quay.name;
  const aimedDepartureTime = estimatedCall.aimedDepartureTime
    .split('T')
    .pop()
    .split(':00+')[0];
  return `${aimedDepartureTime} fra ${quayName} (${serviceJourney.id})`;
};

export const buildServiceJourneyOptions = (
  departures: any[],
): { label: string; value: string }[] => {
  const cutoff = Date.now() + TEN_MINUTES_MS;
  return departures
    .filter(
      (sj) =>
        Date.parse(
          sj.estimatedCalls[sj.estimatedCalls.length - 1].aimedArrivalTime,
        ) > cutoff,
    )
    .sort(
      (a, b) =>
        Date.parse(a.estimatedCalls[0].aimedDepartureTime) -
        Date.parse(b.estimatedCalls[0].aimedDepartureTime),
    )
    .map((item) => ({
      label:
        new Date(
          Date.parse(item.estimatedCalls[0].aimedDepartureTime),
        ).toLocaleTimeString(navigator.language, {
          hour: '2-digit',
          minute: '2-digit',
        }) +
        ' fra ' +
        item.estimatedCalls[0].quay.name +
        ' (' +
        item.id +
        ')',
      value: item.id,
    }));
};

export const getCancellationLabel = (item: any): string => {
  if (item.cancellation) return 'Ja';
  if (item.estimatedCalls.estimatedCall.some((call: any) => call.cancellation))
    return 'Delvis';
  return 'Nei';
};
