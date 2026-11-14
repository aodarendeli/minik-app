import { memoryStorage } from '@/core/storage/key-value';
import { Table } from '@/core/storage/table';

import type { Baby, BabyRepository } from '../domain';

export class LocalBabyRepository implements BabyRepository {
  constructor(private readonly table = new Table<Baby>(memoryStorage(), 'babies')) {}

  async list() {
    return this.table.values();
  }

  async getById(id: string) {
    return this.table.get(id);
  }

  async save(baby: Baby) {
    this.table.put(baby);
  }
}
