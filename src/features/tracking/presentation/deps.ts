import { createDepsContext } from '@/core/di';
import type { Clock } from '@/core/time';

import type { TrackingUseCases } from '../domain';

export const TrackingDeps = createDepsContext<{ useCases: TrackingUseCases; clock: Clock }>('tracking');
