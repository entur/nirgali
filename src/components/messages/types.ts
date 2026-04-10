export type AffectType = 'line' | 'stop' | 'departure';

export interface MessageFormState {
  type: AffectType | undefined;
  chosenLine: string | undefined;
  datedVehicleJourney: string | undefined;
  departureDate: any;
  departures: any[] | undefined;
  specifyStopsLine: boolean;
  specifyStopsDeparture: boolean;
  multipleStops: { value: string; label: string }[];
  reportType: string;
  oppsummering: string;
  beskrivelse: string;
  forslag: string;
  infoLink: { uri: string; label?: string } | undefined;
  from: any;
  to: any;
}
