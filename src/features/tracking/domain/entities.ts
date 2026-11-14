import type { Instant } from '@/core/time';

export type Side = 'left' | 'right';
export type FeedingMethod = 'breast' | 'bottle' | 'solid';
export type BottleContent = 'breastMilk' | 'formula' | 'other';
export type DiaperType = 'wet' | 'dirty' | 'mixed' | 'dry';

export type BreastSegment = { side: Side; startedAt: Instant; endedAt: Instant };

export type EventBase = {
  id: string;
  babyId: string;
  startedAt: Instant;
  endedAt?: Instant;
  note?: string;
  createdAt: Instant;
  updatedAt: Instant;
  deletedAt?: Instant;
  version: number;
};

export type FeedingEvent = EventBase & {
  kind: 'feeding';
  method: FeedingMethod;
  breast?: { segments: BreastSegment[] };
  bottle?: { amountMl: number; content: BottleContent };
  solid?: { items: string[] };
};

export type DiaperEvent = EventBase & { kind: 'diaper'; type: DiaperType };
export type SleepEvent = EventBase & { kind: 'sleep' };

export type CareEvent = FeedingEvent | DiaperEvent | SleepEvent;
export type CareEventKind = CareEvent['kind'];

export type SessionKind = 'breastFeeding' | 'sleep';
export type SessionSegment = { side?: Side; startedAt: Instant; endedAt?: Instant };

/** A running/paused timer. The last segment without `endedAt` is the one counting. */
export type ActiveSession = {
  id: string;
  babyId: string;
  kind: SessionKind;
  status: 'running' | 'paused';
  startedAt: Instant;
  segments: SessionSegment[];
  updatedAt: Instant;
};

export const BOTTLE_MAX_ML = 500;
/** Sessions shorter than this are treated as accidental and not saved. */
export const MIN_SESSION_MS = 30_000;
/** Within this window a timer can be discarded without a confirmation dialog. */
export const QUICK_DISCARD_MS = 10_000;
/** Furthest the start of a running session can be moved back ("started 15 min ago"). */
export const MAX_BACKDATE_MS = 3 * 60 * 60_000;
export const NOTE_MAX = 500;
export const SOLID_ITEMS_MAX = 10;
export const SOLID_ITEM_MAX = 40;
