import { describe, it, expect, vi } from 'vitest';
import {
  isMessageExpired,
  formatDate,
  formatDepartureOption,
  getCancellationLabel,
} from './formatters';

describe('isMessageExpired', () => {
  it('returns true when endTime is in the past', () => {
    expect(isMessageExpired('2020-01-01T00:00:00Z', 'open', Date.now())).toBe(
      true,
    );
  });

  it('returns true when progress is closed', () => {
    expect(isMessageExpired(undefined, 'closed', Date.now())).toBe(true);
  });

  it('returns false when endTime is in the future and progress is open', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isMessageExpired(future, 'open', Date.now())).toBe(false);
  });

  it('returns false when no endTime and progress is open', () => {
    expect(isMessageExpired(undefined, 'open', Date.now())).toBe(false);
  });
});

describe('formatDate', () => {
  it('returns "Ikke oppgitt" for undefined', () => {
    expect(formatDate(undefined)).toBe('Ikke oppgitt');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2024-06-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatDepartureOption', () => {
  it('formats a departure with quay info', () => {
    const sj = {
      id: 'NSB:ServiceJourney:1',
      estimatedCalls: [
        {
          quay: { name: 'Oslo S' },
          aimedDepartureTime: '2024-01-01T10:30:00+01:00',
        },
      ],
    };
    const result = formatDepartureOption(sj);
    expect(result).toContain('Oslo S');
    expect(result).toContain('NSB:ServiceJourney:1');
  });

  it('returns fallback when quay is missing', () => {
    const sj = {
      id: 'NSB:ServiceJourney:1',
      estimatedCalls: [{ quay: null }],
    };
    const result = formatDepartureOption(sj);
    expect(result).toContain('utilgjengelig');
  });

  it('returns fallback when no estimatedCalls', () => {
    const result = formatDepartureOption({ id: 'test' });
    expect(result).toContain('utilgjengelig');
  });
});

describe('getCancellationLabel', () => {
  it('returns "Ja" for full cancellation', () => {
    expect(
      getCancellationLabel({
        cancellation: true,
        estimatedCalls: { estimatedCall: [] },
      }),
    ).toBe('Ja');
  });

  it('returns "Delvis" for partial cancellation', () => {
    expect(
      getCancellationLabel({
        cancellation: false,
        estimatedCalls: {
          estimatedCall: [{ cancellation: true }, { cancellation: false }],
        },
      }),
    ).toBe('Delvis');
  });

  it('returns "Nei" for no cancellation', () => {
    expect(
      getCancellationLabel({
        cancellation: false,
        estimatedCalls: {
          estimatedCall: [{ cancellation: false }],
        },
      }),
    ).toBe('Nei');
  });
});
