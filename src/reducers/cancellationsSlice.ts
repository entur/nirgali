import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Cancellation {
  id: string;
  estimatedVehicleJourney: {
    cancellation: boolean;
    lineRef: string;
    directionRef: string;
    dataSource: string;
    estimatedVehicleJourneyCode: string;
    expiresAtEpochMs: number;
    extraJourney: boolean;
    groupOfLinesRef: string;
    isCompleteStopSequence: boolean;
    monitored: boolean;
    operatorRef: string;
    publishedLineName: string;
    recordedAtTime: string;
    routeRef: string;
    vehicleMode: string;
    estimatedCalls: {
      estimatedCall: any[];
    };
    framedVehicleJourneyRef: {
      dataFrameRef: string;
      datedVehicleJourneyRef: string;
    };
  };
}

export type CancellationsState = Cancellation[];

export const cancellationsSlice = createSlice({
  name: 'cancellations',
  initialState: [] as CancellationsState,
  reducers: {
    setCancellations: (_state, action: PayloadAction<Cancellation[]>) =>
      action.payload,
    clearCancellations: () => [],
  },
});

export const { setCancellations, clearCancellations } =
  cancellationsSlice.actions;
export default cancellationsSlice.reducer;
