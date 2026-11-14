import type { LocalDate } from '@/core/time';

import type { LabTest } from './entities';

export interface LabTestRepository {
  listByBaby(babyId: string): Promise<LabTest[]>;
  listInRange(babyId: string, from: LocalDate, to: LocalDate): Promise<LabTest[]>;
  getById(id: string): Promise<LabTest | undefined>;
  save(test: LabTest): Promise<void>;
}
