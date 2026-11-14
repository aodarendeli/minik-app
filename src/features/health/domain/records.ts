import { appError, toAppError } from '@/core/errors';
import type { IdGenerator } from '@/core/ids';
import { err, ok, type Result } from '@/core/result';
import { fromLocalDate, HOUR_MS, toLocalDate, type Clock, type Instant, type LocalDate } from '@/core/time';

/*
 * Growth measurements and vaccine/medication entries. Logbook only: the app stores what the parent enters and
 * never compares to percentiles, schedules or doses (PRODUCT.md copy rules).
 */

type RecordMeta = { id: string; babyId: string; createdAt: Instant; updatedAt: Instant; deletedAt?: Instant; version: number };

export type GrowthEntry = RecordMeta & {
  measuredOn: LocalDate;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
  note?: string;
};
export type GrowthDraft = Pick<GrowthEntry, 'babyId' | 'measuredOn' | 'weightKg' | 'heightCm' | 'headCm' | 'note'>;
export type GrowthMetric = 'weightKg' | 'heightCm' | 'headCm';
export const GROWTH_METRICS: readonly GrowthMetric[] = ['weightKg', 'heightCm', 'headCm'];

/** Typo guards only (a 35 kg newborn is a decimal-point slip), not medical limits. */
export const GROWTH_LIMITS: Record<GrowthMetric, { min: number; max: number }> = {
  weightKg: { min: 0.3, max: 40 },
  heightCm: { min: 20, max: 150 },
  headCm: { min: 20, max: 60 },
};

export type MedKind = 'vaccine' | 'medication';
export const MED_KINDS: readonly MedKind[] = ['vaccine', 'medication'];

export type MedEntry = RecordMeta & {
  kind: MedKind;
  name: string;
  givenOn: LocalDate;
  /** Free text as written by the doctor/pharmacist (e.g. "2,5 ml"). Never suggested by the app. */
  dose?: string;
  note?: string;
  /** Optional next date (next dose / next vaccine); a local reminder is set for that morning. */
  nextOn?: LocalDate;
};
export type MedDraft = Pick<MedEntry, 'babyId' | 'kind' | 'name' | 'givenOn' | 'dose' | 'note' | 'nextOn'>;

export const RECORD_NAME_MAX = 60;
export const RECORD_DOSE_MAX = 40;
export const RECORD_NOTE_MAX = 500;
/** Reminder time on the chosen day (local). */
export const REMINDER_HOUR = 9;

const clean = (s: string | undefined, max: number) => s?.trim().slice(0, max) || undefined;

export function validateGrowthDraft(d: GrowthDraft, today: LocalDate): Result<GrowthDraft> {
  if (d.measuredOn > today) return err(appError('Validation', 'measuredOn'));
  const values = GROWTH_METRICS.map((m) => d[m]);
  if (values.every((v) => v === undefined)) return err(appError('Validation', 'empty'));
  for (const m of GROWTH_METRICS) {
    const v = d[m];
    if (v !== undefined && (!Number.isFinite(v) || v < GROWTH_LIMITS[m].min || v > GROWTH_LIMITS[m].max)) {
      return err(appError('Validation', m));
    }
  }
  return ok({ ...d, note: clean(d.note, RECORD_NOTE_MAX) });
}

export function validateMedDraft(d: MedDraft, today: LocalDate): Result<MedDraft> {
  const name = d.name.trim();
  if (!name || name.length > RECORD_NAME_MAX) return err(appError('Validation', 'name'));
  if (d.givenOn > today) return err(appError('Validation', 'givenOn'));
  if (d.nextOn !== undefined && d.nextOn <= d.givenOn) return err(appError('Validation', 'nextOn'));
  return ok({ ...d, name, dose: clean(d.dose, RECORD_DOSE_MAX), note: clean(d.note, RECORD_NOTE_MAX) });
}

/** Latest value of each metric (entries may hold only some of them). */
export function latestGrowth(entries: readonly GrowthEntry[]): Partial<Record<GrowthMetric, { value: number; on: LocalDate }>> {
  const out: Partial<Record<GrowthMetric, { value: number; on: LocalDate }>> = {};
  for (const e of [...entries].sort((a, b) => a.measuredOn.localeCompare(b.measuredOn))) {
    for (const m of GROWTH_METRICS) {
      const v = e[m];
      if (v !== undefined) out[m] = { value: v, on: e.measuredOn };
    }
  }
  return out;
}

export interface RecordRepository<T extends RecordMeta> {
  listByBaby(babyId: string): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  save(record: T): Promise<void>;
}

/** Local reminder for a med entry's `nextOn` (notification copy is built by the adapter). */
export interface ReminderPort {
  schedule(reminder: { id: string; at: Instant; kind: MedKind; name: string; babyId: string }): Promise<void>;
  cancel(id: string): Promise<void>;
}

export type RecordDeps = {
  growth: RecordRepository<GrowthEntry>;
  meds: RecordRepository<MedEntry>;
  reminders: ReminderPort;
  clock: Clock;
  ids: IdGenerator;
};

export function createRecordUseCases({ growth, meds, reminders, clock, ids }: RecordDeps) {
  async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return ok(await fn());
    } catch (e) {
      return err(toAppError(e));
    }
  }
  const alive = <T extends RecordMeta>(rows: T[]) => rows.filter((r) => r.deletedAt === undefined);
  const meta = <T extends RecordMeta>(existing: T | undefined, now: Instant) => ({
    id: existing?.id ?? ids.next(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  });
  /** Reminders never block saving: a refused permission or adapter error must not lose the entry. */
  const quietly = (p: () => Promise<void>) => p().catch(() => undefined);

  async function syncReminder(entry: MedEntry) {
    await quietly(() => reminders.cancel(entry.id));
    if (entry.deletedAt !== undefined || entry.nextOn === undefined) return;
    const at = fromLocalDate(entry.nextOn) + REMINDER_HOUR * HOUR_MS;
    if (at <= clock.now()) return;
    await quietly(() => reminders.schedule({ id: entry.id, at, kind: entry.kind, name: entry.name, babyId: entry.babyId }));
  }

  async function setDeleted<T extends RecordMeta>(repo: RecordRepository<T>, id: string, deleted: boolean): Promise<Result<T>> {
    const row = await repo.getById(id);
    if (!row) return err(appError('NotFound'));
    const now = clock.now();
    const next: T = { ...row, deletedAt: deleted ? now : undefined, updatedAt: now, version: row.version + 1 };
    return attempt(async () => {
      await repo.save(next);
      return next;
    });
  }

  return {
    listGrowth: (babyId: string) =>
      attempt(async () => alive(await growth.listByBaby(babyId)).sort((a, b) => b.measuredOn.localeCompare(a.measuredOn) || b.createdAt - a.createdAt)),

    saveGrowth: async (draft: GrowthDraft, existingId?: string): Promise<Result<GrowthEntry>> => {
      const now = clock.now();
      const valid = validateGrowthDraft(draft, toLocalDate(now));
      if (!valid.ok) return valid;
      const existing = existingId ? await growth.getById(existingId) : undefined;
      if (existingId && !existing) return err(appError('NotFound'));
      const entry: GrowthEntry = { ...valid.value, ...meta(existing, now) };
      return attempt(async () => {
        await growth.save(entry);
        return entry;
      });
    },

    deleteGrowth: (id: string) => setDeleted(growth, id, true),
    restoreGrowth: (id: string) => setDeleted(growth, id, false),

    listMeds: (babyId: string) =>
      attempt(async () => alive(await meds.listByBaby(babyId)).sort((a, b) => b.givenOn.localeCompare(a.givenOn) || b.createdAt - a.createdAt)),

    saveMed: async (draft: MedDraft, existingId?: string): Promise<Result<MedEntry>> => {
      const now = clock.now();
      const valid = validateMedDraft(draft, toLocalDate(now));
      if (!valid.ok) return valid;
      const existing = existingId ? await meds.getById(existingId) : undefined;
      if (existingId && !existing) return err(appError('NotFound'));
      const entry: MedEntry = { ...valid.value, ...meta(existing, now) };
      return attempt(async () => {
        await meds.save(entry);
        await syncReminder(entry);
        return entry;
      });
    },

    deleteMed: async (id: string) => {
      const res = await setDeleted(meds, id, true);
      if (res.ok) await syncReminder(res.value);
      return res;
    },
    restoreMed: async (id: string) => {
      const res = await setDeleted(meds, id, false);
      if (res.ok) await syncReminder(res.value);
      return res;
    },
  };
}

export type RecordUseCases = ReturnType<typeof createRecordUseCases>;
