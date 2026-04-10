import { describe, it, expect } from 'vitest';
import { getLineOption } from './getLineOption';

describe('getLineOption', () => {
  const lines = [
    { id: 'NSB:Line:1', name: 'Nordlandsbanen', publicCode: 'R1' },
    { id: 'NSB:Line:2', name: 'Bergensbanen', publicCode: 'R2' },
  ];

  it('returns matching line as option', () => {
    const result = getLineOption(lines, 'NSB:Line:1');
    expect(result).toEqual({
      value: 'NSB:Line:1',
      label: 'Nordlandsbanen (R1) - NSB:Line:1',
    });
  });

  it('returns unknown label when line not found', () => {
    const result = getLineOption(lines, 'NSB:Line:999');
    expect(result).toEqual({ label: 'Ukjent linje' });
  });

  it('returns unknown label for undefined id', () => {
    const result = getLineOption(lines, undefined as any);
    expect(result).toEqual({ label: 'Ukjent linje' });
  });
});
