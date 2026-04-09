import { describe, it, expect } from 'vitest';
import {
  restoreCancellationCalls,
  determineCancellationStatus,
  getQuayLabels,
} from './cancellationHelpers';

describe('restoreCancellationCalls', () => {
  it('sets cancellation to false on all calls', () => {
    const calls = [
      { cancellation: true, stopPointRef: 'Q:1' },
      { cancellation: true, stopPointRef: 'Q:2' },
    ];
    const result = restoreCancellationCalls(calls, { passingTimes: [] });
    expect(result.every((c) => c.cancellation === false)).toBe(true);
  });

  it('restores arrivalStatus to onTime', () => {
    const calls = [
      { cancellation: true, arrivalStatus: 'cancelled', stopPointRef: 'Q:1' },
    ];
    const result = restoreCancellationCalls(calls, { passingTimes: [] });
    expect(result[0].arrivalStatus).toBe('onTime');
  });

  it('restores departureStatus to onTime', () => {
    const calls = [
      {
        cancellation: true,
        departureStatus: 'cancelled',
        stopPointRef: 'Q:1',
      },
    ];
    const result = restoreCancellationCalls(calls, { passingTimes: [] });
    expect(result[0].departureStatus).toBe('onTime');
  });

  it('restores boarding activity from passingTimes', () => {
    const calls = [
      {
        cancellation: true,
        departureBoardingActivity: 'noBoarding',
        arrivalBoardingActivity: 'noAlighting',
        stopPointRef: 'Q:1',
      },
    ];
    const serviceJourney = {
      passingTimes: [
        { quay: { id: 'Q:1' }, forBoarding: true, forAlighting: false },
      ],
    };
    const result = restoreCancellationCalls(calls, serviceJourney);
    expect(result[0].departureBoardingActivity).toBe('boarding');
    expect(result[0].arrivalBoardingActivity).toBe('noAlighting');
  });

  it('does not mutate original calls', () => {
    const calls = [{ cancellation: true, stopPointRef: 'Q:1' }];
    restoreCancellationCalls(calls, { passingTimes: [] });
    expect(calls[0].cancellation).toBe(true);
  });
});

describe('determineCancellationStatus', () => {
  it('returns isCancelled true for full cancellation', () => {
    const evj = {
      cancellation: true,
      estimatedCalls: { estimatedCall: [] },
    };
    expect(determineCancellationStatus(evj)).toEqual({
      isCancelled: true,
      isPartiallyCancelled: false,
    });
  });

  it('returns isPartiallyCancelled true when some calls cancelled', () => {
    const evj = {
      cancellation: false,
      estimatedCalls: {
        estimatedCall: [
          { cancellation: true, Cancellation: false },
          { cancellation: false, Cancellation: false },
        ],
      },
    };
    expect(determineCancellationStatus(evj)).toEqual({
      isCancelled: false,
      isPartiallyCancelled: true,
    });
  });

  it('returns both false when not cancelled', () => {
    const evj = {
      cancellation: false,
      estimatedCalls: {
        estimatedCall: [{ cancellation: false, Cancellation: false }],
      },
    };
    expect(determineCancellationStatus(evj)).toEqual({
      isCancelled: false,
      isPartiallyCancelled: false,
    });
  });
});

describe('getQuayLabels', () => {
  it('returns empty array when no serviceJourney calls', () => {
    expect(getQuayLabels({}, null)).toEqual([]);
    expect(getQuayLabels({}, { estimatedCalls: [] })).toEqual([]);
  });

  it('returns labels for cancelled quays', () => {
    const cancellation = {
      estimatedVehicleJourney: {
        estimatedCalls: {
          estimatedCall: [
            { Cancellation: true, stopPointRef: 'Q:1' },
            { Cancellation: false, stopPointRef: 'Q:2' },
          ],
        },
      },
    };
    const serviceJourney = {
      estimatedCalls: [
        { quay: { id: 'Q:1', name: 'Oslo S' } },
        { quay: { id: 'Q:2', name: 'Bergen' } },
      ],
    };
    const result = getQuayLabels(cancellation, serviceJourney);
    expect(result).toEqual(['Oslo S - Q:1']);
  });
});
