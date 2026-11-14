import { appError } from '@/core/errors';
import { err, ok, type Result } from '@/core/result';
import type { Instant, LocalDate } from '@/core/time';

export type LabCategory = 'blood' | 'urine' | 'stool' | 'screening' | 'hearing' | 'other';
export const LAB_CATEGORIES: readonly LabCategory[] = ['blood', 'urine', 'stool', 'screening', 'hearing', 'other'];

/** One measured value. The reference range is copied from the lab sheet by the user; the app never ships one. */
export type LabResult = {
  id: string;
  analyte: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
};

export type LabTest = {
  id: string;
  babyId: string;
  takenOn: LocalDate;
  category: LabCategory;
  title: string;
  labName?: string;
  note?: string;
  results: LabResult[];
  createdAt: Instant;
  updatedAt: Instant;
  deletedAt?: Instant;
  version: number;
};

export type LabResultDraft = Omit<LabResult, 'id'> & { id?: string };
export type LabTestDraft = Pick<LabTest, 'babyId' | 'takenOn' | 'category' | 'title' | 'labName' | 'note'> & {
  results: LabResultDraft[];
};

/** Position relative to the lab-provided range. Descriptive only; never a judgement. */
export type RangePosition = 'below' | 'within' | 'above' | 'noRange';

export function rangePosition(r: Pick<LabResult, 'value' | 'refLow' | 'refHigh'>): RangePosition {
  if (r.refLow === undefined && r.refHigh === undefined) return 'noRange';
  if (r.refLow !== undefined && r.value < r.refLow) return 'below';
  if (r.refHigh !== undefined && r.value > r.refHigh) return 'above';
  return 'within';
}

export const LAB_TITLE_MAX = 60;
export const LAB_TEXT_MAX = 60;
export const LAB_RESULTS_MAX = 40;

export function validateLabDraft(draft: LabTestDraft, today: LocalDate): Result<LabTestDraft> {
  const title = draft.title.trim();
  if (!title || title.length > LAB_TITLE_MAX) return err(appError('Validation', 'title'));
  if (draft.takenOn > today) return err(appError('Validation', 'takenOn'));
  const results = draft.results
    .map((r) => ({ ...r, analyte: r.analyte.trim(), unit: r.unit.trim() }))
    .filter((r) => r.analyte.length > 0);
  if (results.length > LAB_RESULTS_MAX) return err(appError('Limit', 'results'));
  if (results.some((r) => r.analyte.length > LAB_TEXT_MAX || r.unit.length > LAB_TEXT_MAX)) return err(appError('Validation', 'analyte'));
  if (results.some((r) => !Number.isFinite(r.value))) return err(appError('Validation', 'value'));
  if (results.some((r) => r.refLow !== undefined && r.refHigh !== undefined && r.refLow > r.refHigh)) {
    return err(appError('Validation', 'range'));
  }
  return ok({ ...draft, title, labName: draft.labName?.trim() || undefined, note: draft.note?.trim() || undefined, results });
}

export type AnalytePoint = { testId: string; takenOn: LocalDate; value: number; unit: string; position: RangePosition };

/** History of one analyte across tests (case-insensitive name match), oldest first. */
export function analyteHistory(tests: readonly LabTest[], analyte: string): AnalytePoint[] {
  const key = analyte.trim().toLocaleLowerCase();
  return tests
    .filter((t) => t.deletedAt === undefined)
    .flatMap((t) =>
      t.results
        .filter((r) => r.analyte.toLocaleLowerCase() === key)
        .map((r) => ({ testId: t.id, takenOn: t.takenOn, value: r.value, unit: r.unit, position: rangePosition(r) })),
    )
    .sort((a, b) => a.takenOn.localeCompare(b.takenOn));
}

export function countOutsideRange(test: LabTest): number {
  return test.results.filter((r) => {
    const p = rangePosition(r);
    return p === 'below' || p === 'above';
  }).length;
}

/** Quick-start template: analyte names and units only. Reference ranges always come from the user's lab sheet. */
export type LabPreset = { key: string; category: LabCategory; title: string; analytes: { analyte: string; unit: string }[] };
