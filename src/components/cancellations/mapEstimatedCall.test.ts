import { describe, it, expect } from 'vitest';
import { mapEstimatedCall } from './mapEstimatedCall';

const makeDepartureData = (callCount: number) => ({
  estimatedCalls: Array.from({ length: callCount }, (_, i) => ({
    stopPositionInPattern: i,
  })),
  passingTimes: Array.from({ length: callCount }, () => ({
    forBoarding: true,
    forAlighting: true,
    requestStop: false,
  })),
});

const makeEstimatedCall = (index: number) => ({
  stopPositionInPattern: index,
  quay: {
    id: `NSR:Quay:${index}`,
    name: `Stop ${index}`,
    stopPlace: { id: `NSR:StopPlace:${index}` },
  },
  aimedDepartureTime: '2024-01-01T10:00:00Z',
  aimedArrivalTime: '2024-01-01T09:55:00Z',
  expectedDepartureTime: '2024-01-01T10:00:00Z',
  expectedArrivalTime: '2024-01-01T09:55:00Z',
});

describe('mapEstimatedCall', () => {
  it('maps a first stop (no arrival times)', () => {
    const departureData = makeDepartureData(3);
    const call = makeEstimatedCall(0);
    const result = mapEstimatedCall(call, departureData, []);

    expect(result.stopPointRef).toBe('NSR:Quay:0');
    expect(result.order).toBe(1);
    expect(result.cancellation).toBe(true);
    expect(result.aimedArrivalTime).toBeNull();
    expect(result.arrivalStatus).toBeNull();
    expect(result.aimedDepartureTime).toBe('2024-01-01T10:00:00Z');
    expect(result.departureStatus).toBe('cancelled');
  });

  it('maps a last stop (no departure times)', () => {
    const departureData = makeDepartureData(3);
    const call = makeEstimatedCall(2);
    const result = mapEstimatedCall(call, departureData, []);

    expect(result.aimedDepartureTime).toBeNull();
    expect(result.departureStatus).toBeNull();
    expect(result.aimedArrivalTime).toBe('2024-01-01T09:55:00Z');
    expect(result.arrivalStatus).toBe('cancelled');
  });

  it('maps a middle stop with all times', () => {
    const departureData = makeDepartureData(3);
    const call = makeEstimatedCall(1);
    const result = mapEstimatedCall(call, departureData, []);

    expect(result.aimedArrivalTime).toBe('2024-01-01T09:55:00Z');
    expect(result.aimedDepartureTime).toBe('2024-01-01T10:00:00Z');
    expect(result.arrivalStatus).toBe('cancelled');
    expect(result.departureStatus).toBe('cancelled');
  });

  it('marks stop as not cancelled when not in departureStops list', () => {
    const departureData = makeDepartureData(3);
    const call = makeEstimatedCall(1);
    const result = mapEstimatedCall(call, departureData, [
      'NSR:StopPlace:0',
      'NSR:StopPlace:2',
    ]);

    expect(result.cancellation).toBe(false);
    expect(result.arrivalStatus).toBe('onTime');
    expect(result.departureStatus).toBe('onTime');
  });

  it('keeps stop cancelled when in departureStops list', () => {
    const departureData = makeDepartureData(3);
    const call = makeEstimatedCall(1);
    const result = mapEstimatedCall(call, departureData, [
      'NSR:StopPlace:1',
    ]);

    expect(result.cancellation).toBe(true);
    expect(result.arrivalStatus).toBe('cancelled');
  });

  it('sets boarding activities based on passingTimes', () => {
    const departureData = {
      estimatedCalls: [{ stopPositionInPattern: 0 }],
      passingTimes: [
        { forBoarding: false, forAlighting: true, requestStop: true },
      ],
    };
    const call = makeEstimatedCall(0);
    call.stopPositionInPattern = 0;
    const result = mapEstimatedCall(call, departureData, []);

    expect(result.departureBoardingActivity).toBe('noBoarding');
    expect(result.arrivalBoardingActivity).toBe('alighting');
    expect(result.requestStop).toBe(true);
  });
});
