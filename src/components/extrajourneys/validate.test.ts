import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExtrajourneyValidation, runValidation, validateCallTimes, CallValidationResult } from './validate';
import { VehicleMode } from './types';

const validInput = {
  name: 'Test journey',
  mode: VehicleMode.bus,
  destinationDisplay: 'Oslo S',
  operator: { id: 'OP:1', name: 'Test Operator' },
  line: {
    id: 'NSB:Line:1',
    name: 'Test Line',
    publicCode: '123',
    operator: { id: 'OP:1', name: 'Test Operator' },
  },
  calls: [
    {
      quay: { id: 'NSR:Quay:1', publicCode: '1' },
      boarding: true,
      alighting: false,
      departure: new Date(Date.now() + 3600000).toISOString(),
    },
    {
      quay: { id: 'NSR:Quay:2', publicCode: '2' },
      boarding: false,
      alighting: true,
      arrival: new Date(Date.now() + 7200000).toISOString(),
    },
  ],
};

describe('runValidation (pure function)', () => {
  it('returns empty result for valid input', () => {
    const result = runValidation(validInput);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('errors when name is missing', () => {
    const result = runValidation({ ...validInput, name: undefined });
    expect(result.name).toBeDefined();
  });

  it('errors when mode is missing', () => {
    const result = runValidation({ ...validInput, mode: undefined });
    expect(result.mode).toBeDefined();
  });

  it('errors when operator is missing', () => {
    const result = runValidation({ ...validInput, operator: undefined });
    expect(result.operator).toBeDefined();
  });

  it('errors when line is missing', () => {
    const result = runValidation({ ...validInput, line: undefined });
    expect(result.line).toBeDefined();
  });

  it('errors when destinationDisplay is empty', () => {
    const result = runValidation({ ...validInput, destinationDisplay: '' });
    expect(result.destinationDisplay).toBeDefined();
  });

  it('errors when calls have no quays', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        { boarding: true, alighting: false, departure: new Date().toISOString() },
        { boarding: false, alighting: true, arrival: new Date().toISOString() },
      ],
    });
    expect(result.calls).toBeDefined();
    const calls = result.calls as CallValidationResult[];
    expect(calls[0]?.quay).toBeDefined();
    expect(calls[1]?.quay).toBeDefined();
  });

  it('errors when calls have neither boarding nor alighting', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: false,
          alighting: false,
          departure: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: false,
          alighting: false,
          arrival: new Date(Date.now() + 7200000).toISOString(),
        },
      ],
    });
    expect(result.calls).toBeDefined();
  });

  it('errors when arrival is before previous departure (time travel)', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: true,
          alighting: false,
          departure: '2024-01-01T12:00:00Z',
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: false,
          alighting: true,
          arrival: '2024-01-01T11:00:00Z',
        },
      ],
    });
    const calls = result.calls as CallValidationResult[];
    expect(calls[1]?.arrival?.feedback).toBe(
      'Ankomst er før avgang på forrige stopp',
    );
  });

  it('errors when departure is before arrival on same stop', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: true,
          alighting: false,
          departure: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: true,
          alighting: true,
          arrival: '2024-06-01T12:00:00Z',
          departure: '2024-06-01T11:00:00Z',
        },
        {
          quay: { id: 'Q:3', publicCode: '3' },
          boarding: false,
          alighting: true,
          arrival: new Date(Date.now() + 7200000).toISOString(),
        },
      ],
    });
    const calls = result.calls as CallValidationResult[];
    expect(calls[1]?.departure?.feedback).toBe(
      'Avgang kan ikke være før ankomst på samme stopp',
    );
  });

  it('preserves array indices so errors map to correct call', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: true,
          alighting: false,
          departure: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: true,
          alighting: true,
          arrival: new Date(Date.now() + 5400000).toISOString(),
          departure: new Date(Date.now() + 5700000).toISOString(),
        },
        {
          // third call has no quay — error should be at index 2
          boarding: false,
          alighting: true,
          arrival: new Date(Date.now() + 7200000).toISOString(),
        },
      ],
    });
    const calls = result.calls as CallValidationResult[];
    expect(calls).toHaveLength(3);
    expect(calls[0]).toBeUndefined();
    expect(calls[1]).toBeUndefined();
    expect(calls[2]?.quay).toBeDefined();
  });

  it('errors when non-first call is missing arrival', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: true,
          alighting: false,
          departure: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: false,
          alighting: true,
        },
      ],
    });
    const calls = result.calls as CallValidationResult[];
    expect(calls[1]?.arrival?.feedback).toBe('Stoppet må ha en ankomsttid');
  });

  it('errors when non-last call is missing departure', () => {
    const result = runValidation({
      ...validInput,
      calls: [
        {
          quay: { id: 'Q:1', publicCode: '1' },
          boarding: true,
          alighting: false,
        },
        {
          quay: { id: 'Q:2', publicCode: '2' },
          boarding: false,
          alighting: true,
          arrival: new Date(Date.now() + 7200000).toISOString(),
        },
      ],
    });
    const calls = result.calls as CallValidationResult[];
    expect(calls[0]?.departure?.feedback).toBe('Stoppet må ha en avgangstid');
  });
});

describe('useExtrajourneyValidation (hook)', () => {
  it('returns true for valid input on validate()', () => {
    const { result } = renderHook(() => useExtrajourneyValidation(validInput));

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(Object.keys(result.current.result)).toHaveLength(0);
  });

  it('returns false and populates result on invalid input', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, name: undefined }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.name).toBeDefined();
  });
});

describe('validateCallTimes (live validation)', () => {
  it('returns undefined for calls with valid time ordering', () => {
    const results = validateCallTimes([
      { boarding: true, alighting: false, departure: '2024-01-01T10:00:00Z' },
      {
        boarding: false,
        alighting: true,
        arrival: '2024-01-01T11:00:00Z',
        departure: '2024-01-01T11:05:00Z',
      },
      { boarding: false, alighting: true, arrival: '2024-01-01T12:00:00Z' },
    ]);
    expect(results.every((r) => r === undefined)).toBe(true);
  });

  it('detects arrival before previous departure', () => {
    const results = validateCallTimes([
      { boarding: true, alighting: false, departure: '2024-01-01T12:00:00Z' },
      { boarding: false, alighting: true, arrival: '2024-01-01T11:00:00Z' },
    ]);
    expect(results[1]?.arrival?.feedback).toBe(
      'Ankomst er før avgang på forrige stopp',
    );
  });

  it('detects departure before arrival on same stop', () => {
    const results = validateCallTimes([
      { boarding: true, alighting: false, departure: '2024-01-01T10:00:00Z' },
      {
        boarding: true,
        alighting: true,
        arrival: '2024-01-01T12:00:00Z',
        departure: '2024-01-01T11:00:00Z',
      },
      { boarding: false, alighting: true, arrival: '2024-01-01T13:00:00Z' },
    ]);
    expect(results[1]?.departure?.feedback).toBe(
      'Avgang kan ikke være før ankomst på samme stopp',
    );
  });

  it('returns undefined for calls without times set yet', () => {
    const results = validateCallTimes([
      { boarding: true, alighting: false },
      { boarding: false, alighting: true },
    ]);
    expect(results.every((r) => r === undefined)).toBe(true);
  });
});
