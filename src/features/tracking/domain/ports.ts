import type { Instant } from '@/core/time';

import type { ActiveSession, CareEvent, CareEventKind, SessionKind } from './entities';

export interface CareEventRepository {
  add(event: CareEvent): Promise<void>;
  update(event: CareEvent): Promise<void>;
  getById(id: string): Promise<CareEvent | undefined>;
  /** Events overlapping [from, to), including soft-deleted ones only when `includeDeleted`. */
  listInRange(babyId: string, from: Instant, to: Instant, includeDeleted?: boolean): Promise<CareEvent[]>;
  latest(babyId: string, kind?: CareEventKind): Promise<CareEvent | undefined>;
}

export interface ActiveSessionRepository {
  get(babyId: string, kind: SessionKind): Promise<ActiveSession | undefined>;
  listByBaby(babyId: string): Promise<ActiveSession[]>;
  listAll(): Promise<ActiveSession[]>;
  save(session: ActiveSession): Promise<void>;
  remove(id: string): Promise<void>;
}

/**
 * Shows a running/paused session outside the app (notification shade, lock screen).
 * Adapters: Expo notifications (Expo Go, static text), later Android chronometer notification / iOS Live Activity.
 * Calls are idempotent upserts; failures must never affect data (use-cases swallow them).
 */
export interface SessionPresencePort {
  show(session: ActiveSession): Promise<void>;
  hide(sessionId: string): Promise<void>;
}
