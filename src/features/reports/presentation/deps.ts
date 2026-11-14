import { createDepsContext } from '@/core/di';
import type { Clock } from '@/core/time';

import type { ReportUseCases } from '../domain';

export const ReportsDeps = createDepsContext<{ useCases: ReportUseCases; clock: Clock }>('reports');
