import { createDepsContext } from '@/core/di';
import type { Clock } from '@/core/time';

import type { HealthUseCases, LabPreset, RecordUseCases } from '../domain';

export const HealthDeps = createDepsContext<{
  useCases: HealthUseCases;
  records: RecordUseCases;
  clock: Clock;
  presets: readonly LabPreset[];
}>('health');
