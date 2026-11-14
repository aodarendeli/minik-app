import { memoryStorage } from '@/core/storage/key-value';
import { Table } from '@/core/storage/table';

import type { RecordRepository } from '../domain';

/** Growth and med entries share one simple per-table repository. */
export class LocalRecordRepository<T extends { id: string; babyId: string; version: number; createdAt: number; updatedAt: number }>
  implements RecordRepository<T>
{
  constructor(private readonly table = new Table<T>(memoryStorage(), 'records')) {}

  async listByBaby(babyId: string) {
    return this.table.values().filter((r) => r.babyId === babyId);
  }

  async getById(id: string) {
    return this.table.get(id);
  }

  async save(record: T) {
    this.table.put(record);
  }
}
