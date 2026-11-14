import { appError, toAppError } from '@/core/errors';
import type { IdGenerator } from '@/core/ids';
import { err, ok, type Result } from '@/core/result';
import { DAY_MS, type Clock, type Instant, type TimeRange } from '@/core/time';

import { elapsedMs, lastFeeding, sortByStartDesc, suggestedNextSide, summarize, type CareSummary } from './derived';
import {
  BOTTLE_MAX_ML,
  MAX_BACKDATE_MS,
  MIN_SESSION_MS,
  NOTE_MAX,
  SOLID_ITEM_MAX,
  SOLID_ITEMS_MAX,
  type ActiveSession,
  type BottleContent,
  type CareEvent,
  type DiaperType,
  type FeedingEvent,
  type SessionKind,
  type Side,
  type SleepEvent,
} from './entities';
import type { ActiveSessionRepository, CareEventRepository, SessionPresencePort } from './ports';
import {
  backdateSession,
  correctStartSide,
  finishSession,
  pauseSession,
  resumeSession,
  startSession,
  switchSide,
} from './session';

export type TrackingDeps = {
  events: CareEventRepository;
  sessions: ActiveSessionRepository;
  clock: Clock;
  ids: IdGenerator;
  presence?: SessionPresencePort;
};

/** Result of stopping: the saved event, or `null` with the reason nothing was saved. */
export type StopResult = { event: FeedingEvent | SleepEvent; tooShort: false } | { event: null; tooShort: boolean };

export type DayOverview = {
  events: CareEvent[];
  summary: CareSummary;
  lastFeeding?: FeedingEvent;
  nextSide: Side;
  sessions: ActiveSession[];
};

async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(toAppError(e));
  }
}

function cleanNote(note?: string): string | undefined {
  const trimmed = note?.trim();
  return trimmed ? trimmed.slice(0, NOTE_MAX) : undefined;
}

export function createTrackingUseCases({ events, sessions, clock, ids, presence }: TrackingDeps) {
  /** Data is persisted first; presence is a best-effort side effect and never fails a use-case. */
  const showPresence = async (session: ActiveSession) => {
    try {
      await presence?.show(session);
    } catch {
      // ignore: in-app timer remains the source of truth
    }
  };
  const hidePresence = async (sessionId: string) => {
    try {
      await presence?.hide(sessionId);
    } catch {
      // ignore
    }
  };

  const base = (babyId: string, at: Instant | undefined, note?: string) => {
    const now = clock.now();
    return { id: ids.next(), babyId, startedAt: Math.min(at ?? now, now), note: cleanNote(note), createdAt: now, updatedAt: now, version: 1 };
  };

  async function mutateSession(babyId: string, kind: SessionKind, fn: (s: ActiveSession, now: Instant) => ActiveSession) {
    const current = await sessions.get(babyId, kind);
    if (!current) return err(appError('NotFound'));
    const next = fn(current, clock.now());
    if (next !== current) {
      await sessions.save(next);
      await showPresence(next);
    }
    return ok(next);
  }

  return {
    getDayOverview: (babyId: string, range: TimeRange) =>
      attempt<DayOverview>(async () => {
        const [inRange, recent, active] = await Promise.all([
          events.listInRange(babyId, range.from, range.to),
          events.listInRange(babyId, range.to - 7 * DAY_MS, range.to),
          sessions.listByBaby(babyId),
        ]);
        const feeds = recent.filter((e): e is FeedingEvent => e.kind === 'feeding');
        const lastBreast = lastFeeding(feeds.filter((f) => f.method === 'breast'));
        return {
          events: sortByStartDesc(inRange),
          summary: summarize(inRange, range),
          lastFeeding: lastFeeding(feeds),
          nextSide: suggestedNextSide(lastBreast),
          sessions: active,
        };
      }),

    getNextSide: (babyId: string) =>
      attempt(async () => {
        const now = clock.now();
        const recent = await events.listInRange(babyId, now - 7 * DAY_MS, now + 1);
        const breast = recent.filter((e): e is FeedingEvent => e.kind === 'feeding' && e.method === 'breast');
        return suggestedNextSide(lastFeeding(breast));
      }),

    listEvents: (babyId: string, range: TimeRange) =>
      attempt(async () => sortByStartDesc(await events.listInRange(babyId, range.from, range.to))),

    logDiaper: (input: { babyId: string; type: DiaperType; at?: Instant; note?: string }) =>
      attempt(async () => {
        const event: CareEvent = { ...base(input.babyId, input.at, input.note), kind: 'diaper', type: input.type };
        await events.add(event);
        return event;
      }),

    logBottle: async (input: { babyId: string; amountMl: number; content: BottleContent; at?: Instant; note?: string }) => {
      if (!(input.amountMl > 0 && input.amountMl <= BOTTLE_MAX_ML)) return err(appError('Validation', 'amount'));
      return attempt(async () => {
        const event: CareEvent = {
          ...base(input.babyId, input.at, input.note),
          kind: 'feeding',
          method: 'bottle',
          bottle: { amountMl: Math.round(input.amountMl), content: input.content },
        };
        await events.add(event);
        return event;
      });
    },

    logSolid: async (input: { babyId: string; items: string[]; at?: Instant; note?: string }) => {
      const items = input.items.map((i) => i.trim().slice(0, SOLID_ITEM_MAX)).filter(Boolean);
      if (items.length === 0) return err(appError('Validation', 'items'));
      if (items.length > SOLID_ITEMS_MAX) return err(appError('Limit', 'items'));
      return attempt(async () => {
        const event: CareEvent = { ...base(input.babyId, input.at, input.note), kind: 'feeding', method: 'solid', solid: { items } };
        await events.add(event);
        return event;
      });
    },

    getSession: (babyId: string, kind: SessionKind) => attempt(async () => (await sessions.get(babyId, kind)) ?? null),

    startSession: (input: { babyId: string; kind: SessionKind; side?: Side }) =>
      attempt(async () => {
        const existing = await sessions.get(input.babyId, input.kind);
        if (existing) return existing;
        const session = startSession({ ...input, id: ids.next(), now: clock.now() });
        await sessions.save(session);
        await showPresence(session);
        return session;
      }),

    switchSide: (babyId: string, side: Side) => mutateSession(babyId, 'breastFeeding', (s, now) => switchSide(s, side, now)),
    pauseSession: (babyId: string, kind: SessionKind) => mutateSession(babyId, kind, pauseSession),
    resumeSession: (babyId: string, kind: SessionKind) => mutateSession(babyId, kind, resumeSession),

    /** "Started N minutes ago": moves the start back, at most MAX_BACKDATE_MS. */
    setStartedMinutesAgo: (babyId: string, kind: SessionKind, minutesAgo: number) =>
      mutateSession(babyId, kind, (s, now) =>
        backdateSession(s, now - Math.min(Math.max(0, minutesAgo) * 60_000, MAX_BACKDATE_MS), now),
      ),

    correctStartSide: (babyId: string, side: Side) =>
      mutateSession(babyId, 'breastFeeding', (s, now) => correctStartSide(s, side, now)),

    /** Re-posts presence for every persisted session (app launch, locale change, swiped-away notification). */
    restorePresence: () =>
      attempt(async () => {
        const all = await sessions.listAll();
        await Promise.all(all.map(showPresence));
        return all.length;
      }),

    /**
     * Persists the event, then removes the session. If saving fails the session is kept (no data loss).
     * Sessions shorter than MIN_SESSION_MS are discarded as accidental.
     */
    stopSession: (babyId: string, kind: SessionKind) =>
      attempt<StopResult>(async () => {
        const session = await sessions.get(babyId, kind);
        if (!session) return { event: null, tooShort: false };
        const now = clock.now();
        if (elapsedMs(session, now) < MIN_SESSION_MS) {
          await sessions.remove(session.id);
          await hidePresence(session.id);
          return { event: null, tooShort: true };
        }
        const event = finishSession(session, { id: ids.next(), now });
        await events.add(event);
        await sessions.remove(session.id);
        await hidePresence(session.id);
        return { event, tooShort: false };
      }),

    discardSession: (babyId: string, kind: SessionKind) =>
      attempt(async () => {
        const session = await sessions.get(babyId, kind);
        if (session) {
          await sessions.remove(session.id);
          await hidePresence(session.id);
        }
      }),

    deleteEvent: (id: string) => setDeleted(id, true),
    restoreEvent: (id: string) => setDeleted(id, false),
  };

  async function setDeleted(id: string, deleted: boolean): Promise<Result<CareEvent>> {
    const event = await events.getById(id);
    if (!event) return err(appError('NotFound'));
    const now = clock.now();
    const next = { ...event, deletedAt: deleted ? now : undefined, updatedAt: now, version: event.version + 1 };
    return attempt(async () => {
      await events.update(next);
      return next;
    });
  }
}

export type TrackingUseCases = ReturnType<typeof createTrackingUseCases>;
