import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExtrajourneyValidation } from './validate';
import { VehicleMode } from './types';

describe('useExtrajourneyValidation', () => {
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

  it('returns true for valid input', () => {
    const { result } = renderHook(() => useExtrajourneyValidation(validInput));

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(true);
    expect(Object.keys(result.current.result)).toHaveLength(0);
  });

  it('returns false when name is missing', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, name: undefined }),
    );

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.name).toBeDefined();
  });

  it('returns false when mode is missing', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, mode: undefined }),
    );

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.mode).toBeDefined();
  });

  it('returns false when operator is missing', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, operator: undefined }),
    );

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.operator).toBeDefined();
  });

  it('validates calls have quays', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({
        ...validInput,
        calls: [
          {
            boarding: true,
            alighting: false,
            departure: new Date().toISOString(),
          },
          {
            boarding: false,
            alighting: true,
            arrival: new Date().toISOString(),
          },
        ],
      }),
    );

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.calls).toBeDefined();
  });

  it('returns false when line is missing', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, line: undefined }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.line).toBeDefined();
  });

  it('returns false when destinationDisplay is empty', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({ ...validInput, destinationDisplay: '' }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
    expect(result.current.result.destinationDisplay).toBeDefined();
  });

  it('validates calls need both boarding and alighting', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({
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
      }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
  });

  it('validates arrival must be after previous departure', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({
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
      }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
  });

  it('validates non-first calls need arrival time', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({
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
      }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
  });

  it('validates non-last calls need departure time', () => {
    const { result } = renderHook(() =>
      useExtrajourneyValidation({
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
      }),
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid).toBe(false);
  });
});
