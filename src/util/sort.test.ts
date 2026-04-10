import { describe, it, expect } from 'vitest';
import {
  sortBySituationNumber,
  sortCancellationByExpiry,
  sortServiceJourneyByDepartureTime,
} from './sort';

describe('sortBySituationNumber', () => {
  it('sorts by the numeric suffix of situationNumber', () => {
    expect(
      [
        { situationNumber: 'COD:SituationNumber:9' },
        { situationNumber: 'COD:SituationNumber:1' },
        { situationNumber: 'COD:SituationNumber:5' },
        { situationNumber: 'COD:SituationNumber:3' },
      ].sort(sortBySituationNumber),
    ).toEqual([
      { situationNumber: 'COD:SituationNumber:1' },
      { situationNumber: 'COD:SituationNumber:3' },
      { situationNumber: 'COD:SituationNumber:5' },
      { situationNumber: 'COD:SituationNumber:9' },
    ]);
  });
});

describe('sortCancellationByExpiry', () => {
  it('sorts by expiresAtEpochMs descending (newest first)', () => {
    const cancellations = [
      { estimatedVehicleJourney: { expiresAtEpochMs: 1000 } },
      { estimatedVehicleJourney: { expiresAtEpochMs: 3000 } },
      { estimatedVehicleJourney: { expiresAtEpochMs: 2000 } },
    ];
    const sorted = [...cancellations].sort(sortCancellationByExpiry);
    expect(sorted[0].estimatedVehicleJourney.expiresAtEpochMs).toBe(3000);
    expect(sorted[1].estimatedVehicleJourney.expiresAtEpochMs).toBe(2000);
    expect(sorted[2].estimatedVehicleJourney.expiresAtEpochMs).toBe(1000);
  });
});

describe('sortServiceJourneyByDepartureTime', () => {
  it('sorts by aimedDepartureTime ascending', () => {
    const journeys = [
      { estimatedCalls: [{ aimedDepartureTime: '2024-01-01T12:00:00Z' }] },
      { estimatedCalls: [{ aimedDepartureTime: '2024-01-01T08:00:00Z' }] },
      { estimatedCalls: [{ aimedDepartureTime: '2024-01-01T10:00:00Z' }] },
    ];
    const sorted = [...journeys].sort(sortServiceJourneyByDepartureTime);
    expect(sorted[0].estimatedCalls[0].aimedDepartureTime).toBe(
      '2024-01-01T08:00:00Z',
    );
    expect(sorted[1].estimatedCalls[0].aimedDepartureTime).toBe(
      '2024-01-01T10:00:00Z',
    );
    expect(sorted[2].estimatedCalls[0].aimedDepartureTime).toBe(
      '2024-01-01T12:00:00Z',
    );
  });
});
