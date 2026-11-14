import { appError } from '@/core/errors';
import { err, ok, type Result } from '@/core/result';
import { DAY_MS, fromLocalDate, type Instant, type LocalDate } from '@/core/time';

export type BabySex = 'girl' | 'boy' | 'unspecified';
export type BabyColor = 'coral' | 'indigo' | 'green' | 'amber' | 'teal';
export const BABY_COLORS: readonly BabyColor[] = ['teal', 'coral', 'indigo', 'green', 'amber'];

export type Baby = {
  id: string;
  name: string;
  birthDate: LocalDate;
  sex: BabySex;
  color: BabyColor;
  createdAt: Instant;
  updatedAt: Instant;
  archivedAt?: Instant;
};

export type BabyDraft = Pick<Baby, 'name' | 'birthDate' | 'sex' | 'color'>;

/** Short enough for the hero, chips and notification titles on small phones. */
export const BABY_NAME_MAX = 24;
/** Keeps the baby switcher, reports and storage small. */
export const BABY_MAX = 5;
/** The app is for babies and toddlers; an older birth date is almost always a typo. */
export const BABY_MAX_AGE_YEARS = 6;

/** Earliest accepted birth date for `today` (same day, `BABY_MAX_AGE_YEARS` earlier). */
export function earliestBirthDate(today: LocalDate): LocalDate {
  const [y, m, d] = today.split('-');
  return `${Number(y) - BABY_MAX_AGE_YEARS}-${m}-${d}`;
}

export function validateBabyDraft(draft: BabyDraft, today: LocalDate): Result<BabyDraft> {
  const name = draft.name.trim();
  if (name.length === 0 || name.length > BABY_NAME_MAX) return err(appError('Validation', 'name'));
  if (draft.birthDate > today || draft.birthDate < earliestBirthDate(today)) return err(appError('Validation', 'birthDate'));
  return ok({ ...draft, name });
}

export type BabyAge = { days: number; weeks: number; months: number };

/** Completed days/weeks/months since birth. */
export function babyAge(birthDate: LocalDate, today: LocalDate): BabyAge {
  const days = Math.max(0, Math.round((fromLocalDate(today) - fromLocalDate(birthDate)) / DAY_MS));
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  let months = ((ty ?? 0) - (by ?? 0)) * 12 + ((tm ?? 0) - (bm ?? 0));
  if ((td ?? 0) < (bd ?? 0)) months -= 1;
  return { days, weeks: Math.floor(days / 7), months: Math.max(0, months) };
}
