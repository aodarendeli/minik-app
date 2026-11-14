import type { LabTest } from './entities';
import { analyteHistory, countOutsideRange, LAB_RESULTS_MAX, LAB_TITLE_MAX, rangePosition, validateLabDraft } from './entities';

const test = (id: string, takenOn: string, value: number): LabTest => ({
  id,
  babyId: 'b1',
  takenOn,
  category: 'blood',
  title: 'CBC',
  results: [{ id: `${id}-r`, analyte: 'Hemoglobin', value, unit: 'g/dL', refLow: 9, refHigh: 14 }],
  createdAt: 0,
  updatedAt: 0,
  version: 1,
});

describe('lab tests', () => {
  it('positions values against the lab-provided range only', () => {
    expect(rangePosition({ value: 8, refLow: 9, refHigh: 14 })).toBe('below');
    expect(rangePosition({ value: 10 })).toBe('noRange');
    expect(rangePosition({ value: 15, refHigh: 14 })).toBe('above');
    expect(rangePosition({ value: 9, refLow: 9 })).toBe('within');
  });

  it('builds analyte history oldest first, case-insensitive', () => {
    const history = analyteHistory([test('b', '2026-10-01', 10.9), test('a', '2026-09-01', 8.5)], 'hemoglobin');
    expect(history.map((p) => p.value)).toEqual([8.5, 10.9]);
    expect(countOutsideRange(test('c', '2026-09-01', 8.5))).toBe(1);
  });

  it('validates drafts: title, future dates, inverted ranges', () => {
    const base = { babyId: 'b1', takenOn: '2026-11-01', category: 'blood' as const, title: 'CBC', results: [] };
    expect(validateLabDraft({ ...base, title: ' ' }, '2026-11-10').ok).toBe(false);
    expect(validateLabDraft({ ...base, takenOn: '2026-12-01' }, '2026-11-10').ok).toBe(false);
    const inverted = { ...base, results: [{ analyte: 'Hb', value: 10, unit: '', refLow: 14, refHigh: 9 }] };
    expect(validateLabDraft(inverted, '2026-11-10').ok).toBe(false);
    const blankRowsDropped = validateLabDraft({ ...base, results: [{ analyte: '  ', value: Number.NaN, unit: '' }] }, '2026-11-10');
    expect(blankRowsDropped.ok && blankRowsDropped.value.results).toHaveLength(0);
  });

  it('caps title length and number of values', () => {
    const base = { babyId: 'b1', takenOn: '2026-11-01', category: 'blood' as const, title: 'CBC', results: [] };
    expect(validateLabDraft({ ...base, title: 'x'.repeat(LAB_TITLE_MAX + 1) }, '2026-11-10').ok).toBe(false);
    const row = { analyte: 'Hb', value: 10, unit: '' };
    const many = validateLabDraft({ ...base, results: Array(LAB_RESULTS_MAX + 1).fill(row) }, '2026-11-10');
    expect(many.ok === false && many.error.code).toBe('Limit');
  });
});
