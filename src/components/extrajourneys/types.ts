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
  StopPointRef: string;
  StopPointName: string;
  Order: number;
  DestinationDisplay: string;
  AimedArrivalTime: string | null;
  ExpectedArrivalTime: string | null;
  AimedDepartureTime: string | null;
  ExpectedDepartureTime: string | null;
  DepartureBoardingActivity: DepartureBoardingActivity | null;
  ArrivalBoardingActivity: ArrivalBoardingActivity | null;
};

export enum VehicleMode {
  bus = 'bus',
  coach = 'coach',
  ferry = 'ferry',
  metro = 'metro',
  rail = 'rail',
  tram = 'tram',
}

export type ExtraJourney = {
  EstimatedVehicleJourney: {
    RecordedAtTime: string;
    LineRef: string;
    DirectionRef: '0';
    EstimatedVehicleJourneyCode: string;
    ExtraJourney: true;
    VehicleMode: VehicleMode;
    RouteRef: string;
    PublishedLineName: string;
    GroupOfLinesRef: string;
    ExternalLineRef: string;
    OperatorRef: string;
    Monitored: true;
    DataSource: string;
    EstimatedCalls: {
      EstimatedCall: EstimatedCall[];
    };
    IsCompleteStopSequence: true;
    ExpiresAtEpochMs: number;
  };
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
