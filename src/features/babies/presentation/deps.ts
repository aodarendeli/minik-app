import { createDepsContext } from '@/core/di';
import type { Clock } from '@/core/time';

import type { BabyUseCases } from '../domain';

export type BabiesDepsValue = {
  useCases: BabyUseCases;
  clock: Clock;
  /** Deletes the baby and all of its data (entries, labs, timers); resolves to an undo. Provided by composition. */
  deleteBabyWithData: (babyId: string) => Promise<() => Promise<void>>;
};

export const BabiesDeps = createDepsContext<BabiesDepsValue>('babies');
