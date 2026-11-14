import { memoryStorage } from '@/core/storage/key-value';
import { Table } from '@/core/storage/table';
import type { LocalDate } from '@/core/time';

import type { LabTest, LabTestRepository } from '../domain';

export class LocalLabTestRepository implements LabTestRepository {
  constructor(private readonly table = new Table<LabTest>(memoryStorage(), 'labs')) {}

  async listByBaby(babyId: string) {
    return this.table.values().filter((t) => t.babyId === babyId);
  }

  async listInRange(babyId: string, from: LocalDate, to: LocalDate) {
    return this.table
      .values()
      .filter((t) => t.babyId === babyId && t.deletedAt === undefined && t.takenOn >= from && t.takenOn <= to);
  }

  async getById(id: string) {
    return this.table.get(id);
  }

  async save(test: LabTest) {
    this.table.put(test);
  }
}
