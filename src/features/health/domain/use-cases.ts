import { appError, toAppError } from '@/core/errors';
import type { IdGenerator } from '@/core/ids';
import { err, ok, type Result } from '@/core/result';
import { toLocalDate, type Clock } from '@/core/time';

import { analyteHistory, validateLabDraft, type LabTest, type LabTestDraft } from './entities';
import type { LabTestRepository } from './ports';

export type HealthDeps = { labs: LabTestRepository; clock: Clock; ids: IdGenerator };

const byDateDesc = (a: LabTest, b: LabTest) => b.takenOn.localeCompare(a.takenOn) || b.createdAt - a.createdAt;

export function createHealthUseCases({ labs, clock, ids }: HealthDeps) {
  async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return ok(await fn());
    } catch (e) {
      return err(toAppError(e));
    }
  }

  return {
    listLabTests: (babyId: string) =>
      attempt(async () => (await labs.listByBaby(babyId)).filter((t) => t.deletedAt === undefined).sort(byDateDesc)),

    getLabTest: async (id: string): Promise<Result<LabTest>> => {
      const test = await labs.getById(id);
      return test && test.deletedAt === undefined ? ok(test) : err(appError('NotFound'));
    },

    getAnalyteHistory: (babyId: string, analyte: string) =>
      attempt(async () => analyteHistory(await labs.listByBaby(babyId), analyte)),

    saveLabTest: async (draft: LabTestDraft, existingId?: string): Promise<Result<LabTest>> => {
      const now = clock.now();
      const valid = validateLabDraft(draft, toLocalDate(now));
      if (!valid.ok) return valid;
      const existing = existingId ? await labs.getById(existingId) : undefined;
      if (existingId && !existing) return err(appError('NotFound'));
      const test: LabTest = {
        ...valid.value,
        results: valid.value.results.map((r) => ({ ...r, id: r.id ?? ids.next() })),
        id: existing?.id ?? ids.next(),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        version: (existing?.version ?? 0) + 1,
      };
      return attempt(async () => {
        await labs.save(test);
        return test;
      });
    },

    deleteLabTest: (id: string) => setDeleted(id, true),
    restoreLabTest: (id: string) => setDeleted(id, false),
  };

  async function setDeleted(id: string, deleted: boolean): Promise<Result<LabTest>> {
    const test = await labs.getById(id);
    if (!test) return err(appError('NotFound'));
    const now = clock.now();
    const next: LabTest = { ...test, deletedAt: deleted ? now : undefined, updatedAt: now, version: test.version + 1 };
    await labs.save(next);
    return ok(next);
  }
}

export type HealthUseCases = ReturnType<typeof createHealthUseCases>;
