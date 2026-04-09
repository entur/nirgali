import { describe, it, expect } from 'vitest';
import { mapExtraJourney } from './mapExtraJourney';
import { VehicleMode } from './types';

describe('mapExtraJourney', () => {
  const validInput = {
    codespace: 'NSB',
    selectedMode: VehicleMode.bus,
    name: 'Test Journey',
    destinationDisplay: 'Oslo S',
    selectedOperator: { id: 'OP:1', name: 'Test Operator' },
    selectedLine: {
      id: 'NSB:Line:1',
      name: 'Test Line',
      publicCode: '123',
      operator: { id: 'OP:1', name: 'Test Operator' },
    },
    calls: [
      {
        quay: { id: 'NSR:Quay:1', publicCode: '1' },
        stopPlaceName: 'Stop A',
        boarding: true,
        alighting: false,
        departure: '2024-01-01T10:00:00Z',
      },
      {
        quay: { id: 'NSR:Quay:2', publicCode: '2' },
        stopPlaceName: 'Stop B',
        boarding: true,
        alighting: true,
        arrival: '2024-01-01T10:30:00Z',
        departure: '2024-01-01T10:35:00Z',
      },
      {
        quay: { id: 'NSR:Quay:3', publicCode: '3' },
        stopPlaceName: 'Stop C',
        boarding: false,
        alighting: true,
        arrival: '2024-01-01T11:00:00Z',
      },
    ],
  };

  it('creates a valid extra journey payload', () => {
    const result = mapExtraJourney(validInput);
    const evj = result.estimatedVehicleJourney;

    expect(evj.extraJourney).toBe(true);
    expect(evj.vehicleMode).toBe(VehicleMode.bus);
    expect(evj.publishedLineName).toBe('Test Journey');
    expect(evj.operatorRef).toBe('OP:1');
    expect(evj.externalLineRef).toBe('NSB:Line:1');
    expect(evj.dataSource).toBe('NSB');
    expect(evj.monitored).toBe(true);
    expect(evj.isCompleteStopSequence).toBe(true);
    expect(evj.directionRef).toBe('0');
  });

  it('maps estimated calls correctly', () => {
    const result = mapExtraJourney(validInput);
    const calls = result.estimatedVehicleJourney.estimatedCalls.estimatedCall;

    expect(calls).toHaveLength(3);

    // First call: no arrival, has departure, boarding only
    expect(calls[0].stopPointRef).toBe('NSR:Quay:1');
    expect(calls[0].stopPointName).toBe('Stop A');
    expect(calls[0].order).toBe(1);
    expect(calls[0].aimedArrivalTime).toBeNull();
    expect(calls[0].aimedDepartureTime).toBe('2024-01-01T10:00:00Z');
    expect(calls[0].arrivalBoardingActivity).toBeNull();
    expect(calls[0].departureBoardingActivity).toBe('boarding');

    // Middle call: has both arrival and departure
    expect(calls[1].order).toBe(2);
    expect(calls[1].aimedArrivalTime).toBe('2024-01-01T10:30:00Z');
    expect(calls[1].aimedDepartureTime).toBe('2024-01-01T10:35:00Z');
    expect(calls[1].arrivalBoardingActivity).toBe('alighting');
    expect(calls[1].departureBoardingActivity).toBe('boarding');

    // Last call: has arrival, no departure, alighting only
    expect(calls[2].order).toBe(3);
    expect(calls[2].aimedArrivalTime).toBe('2024-01-01T11:00:00Z');
    expect(calls[2].aimedDepartureTime).toBeNull();
    expect(calls[2].arrivalBoardingActivity).toBe('alighting');
    expect(calls[2].departureBoardingActivity).toBeNull();
  });

  it('sets destinationDisplay on all calls', () => {
    const result = mapExtraJourney(validInput);
    const calls = result.estimatedVehicleJourney.estimatedCalls.estimatedCall;
    calls.forEach((call: any) => {
      expect(call.destinationDisplay).toBe('Oslo S');
    });
  });

  it('sets expiresAtEpochMs from last call arrival', () => {
    const result = mapExtraJourney(validInput);
    expect(result.estimatedVehicleJourney.expiresAtEpochMs).toBe(
      Date.parse('2024-01-01T11:00:00Z'),
    );
  });

  it('throws when required fields are missing', () => {
    expect(() =>
      mapExtraJourney({ ...validInput, selectedMode: undefined }),
    ).toThrow('Invalid data');

    expect(() =>
      mapExtraJourney({ ...validInput, name: undefined }),
    ).toThrow('Invalid data');

    expect(() =>
      mapExtraJourney({ ...validInput, selectedOperator: undefined }),
    ).toThrow('Invalid data');

    expect(() =>
      mapExtraJourney({ ...validInput, selectedLine: undefined }),
    ).toThrow('Invalid data');
  });

  it('handles noBoarding for last stop and noAlighting for first stop', () => {
    const result = mapExtraJourney({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          stopPlaceName: 'A',
          boarding: false,
          alighting: false,
          departure: '2024-01-01T10:00:00Z',
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          stopPlaceName: 'B',
          boarding: false,
          alighting: false,
          arrival: '2024-01-01T11:00:00Z',
        },
      ],
    });
    const calls = result.estimatedVehicleJourney.estimatedCalls.estimatedCall;
    expect(calls[0].departureBoardingActivity).toBe('noBoarding');
    expect(calls[1].arrivalBoardingActivity).toBe('noAlighting');
  });
});
