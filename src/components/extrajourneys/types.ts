export type Call = {
  quay?: Quay;
  stopPlaceName?: string;
  boarding?: boolean;
  alighting?: boolean;
  arrival?: string;
  departure?: string;
};

export type DepartureBoardingActivity = 'boarding' | 'noBoarding';
export type ArrivalBoardingActivity = 'alighting' | 'noAlighting';

export type EstimatedCall = {
  stopPointRef: string;
  stopPointName: string;
  order: number;
  destinationDisplay: string;
  aimedArrivalTime: string | null;
  expectedArrivalTime: string | null;
  aimedDepartureTime: string | null;
  expectedDepartureTime: string | null;
  departureBoardingActivity: DepartureBoardingActivity | null;
  arrivalBoardingActivity: ArrivalBoardingActivity | null;
};

export enum VehicleMode {
  bus = 'bus',
  coach = 'coach',
  ferry = 'ferry',
  metro = 'metro',
  rail = 'rail',
  tram = 'tram',
}

export type EstimatedVehicleJourney = {
  recordedAtTime: string;
  lineRef: string;
  directionRef: '0';
  estimatedVehicleJourneyCode: string;
  extraJourney: true;
  vehicleMode: VehicleMode;
  routeRef: string;
  publishedLineName: string;
  groupOfLinesRef: string;
  externalLineRef: string;
  operatorRef: string;
  monitored: true;
  dataSource: string;
  estimatedCalls: {
    estimatedCall: EstimatedCall[];
  };
  isCompleteStopSequence: true;
  expiresAtEpochMs: number;
};

export type ExtraJourney = {
  id?: string;
  estimatedVehicleJourney: EstimatedVehicleJourney;
};

export type GeocodedStopPlace = {
  properties: {
    id: string;
    name: string;
  };
};

export type Quay = {
  id: string;
  publicCode: string;
};
