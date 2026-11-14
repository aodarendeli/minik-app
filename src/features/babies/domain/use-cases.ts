import { appError, toAppError } from '@/core/errors';
import type { IdGenerator } from '@/core/ids';
import { err, ok, type Result } from '@/core/result';
import { toLocalDate, type Clock } from '@/core/time';

import { BABY_MAX, validateBabyDraft, type Baby, type BabyDraft } from './entities';
import type { BabyRepository } from './ports';

export type BabyDeps = { babies: BabyRepository; clock: Clock; ids: IdGenerator };

export function createBabyUseCases({ babies, clock, ids }: BabyDeps) {
  return {
    async listBabies(): Promise<Result<Baby[]>> {
      try {
        const all = await babies.list();
        return ok(all.filter((b) => b.archivedAt === undefined).sort((a, b) => a.createdAt - b.createdAt));
      } catch (e) {
        return err(toAppError(e));
      }
    },

    async createBaby(draft: BabyDraft): Promise<Result<Baby>> {
      const now = clock.now();
      const valid = validateBabyDraft(draft, toLocalDate(now));
      if (!valid.ok) return valid;
      try {
        const active = (await babies.list()).filter((b) => b.archivedAt === undefined);
        if (active.length >= BABY_MAX) return err(appError('Limit', 'babies'));
      } catch (e) {
        return err(toAppError(e));
      }
      const baby: Baby = { ...valid.value, id: ids.next(), createdAt: now, updatedAt: now };
      try {
        await babies.save(baby);
        return ok(baby);
      } catch (e) {
        return err(toAppError(e));
      }
    },

    async updateBaby(id: string, draft: BabyDraft): Promise<Result<Baby>> {
      const now = clock.now();
      const valid = validateBabyDraft(draft, toLocalDate(now));
      if (!valid.ok) return valid;
      const existing = await babies.getById(id);
      if (!existing) return err(appError('NotFound'));
      const baby: Baby = { ...existing, ...valid.value, updatedAt: now };
      await babies.save(baby);
      return ok(baby);
    },
  };
}

export type BabyUseCases = ReturnType<typeof createBabyUseCases>;
