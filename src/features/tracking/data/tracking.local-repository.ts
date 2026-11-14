import { appError } from '@/core/errors';
import { memoryStorage } from '@/core/storage/key-value';
import { Table } from '@/core/storage/table';
import type { Instant } from '@/core/time';

import type { ActiveSession, ActiveSessionRepository, CareEvent, CareEventKind, CareEventRepository, SessionKind } from '../domain';

export class LocalCareEventRepository implements CareEventRepository {
  constructor(private readonly table = new Table<CareEvent>(memoryStorage(), 'events')) {}

  async add(event: CareEvent) {
    this.table.put(event);
  }

  async update(event: CareEvent) {
    if (!this.table.has(event.id)) throw appError('NotFound');
    this.table.put(event);
  }

  async getById(id: string) {
    return this.table.get(id);
  }

  async listInRange(babyId: string, from: Instant, to: Instant, includeDeleted = false) {
    return this.table
      .values()
      .filter(
        (e) =>
          e.babyId === babyId &&
          (includeDeleted || e.deletedAt === undefined) &&
          e.startedAt < to &&
          (e.endedAt ?? e.startedAt) >= from,
      );
  }

  async latest(babyId: string, kind?: CareEventKind) {
    let best: CareEvent | undefined;
    for (const e of this.table.values()) {
      if (e.babyId !== babyId || e.deletedAt !== undefined || (kind && e.kind !== kind)) continue;
      if (!best || e.startedAt > best.startedAt) best = e;
    }
    return best;
  }
}

export class LocalActiveSessionRepository implements ActiveSessionRepository {
  constructor(private readonly table = new Table<ActiveSession>(memoryStorage(), 'sessions')) {}

  async get(babyId: string, kind: SessionKind) {
    return this.table.values().find((s) => s.babyId === babyId && s.kind === kind);
  }

  async listByBaby(babyId: string) {
    return this.table.values().filter((s) => s.babyId === babyId);
  }

  async listAll() {
    return this.table.values();
  }

  async save(session: ActiveSession) {
    this.table.put(session);
  }

  async remove(id: string) {
    this.table.delete(id);
  }
}
