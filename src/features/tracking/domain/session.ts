import type { Instant } from '@/core/time';

import type { ActiveSession, FeedingEvent, SessionKind, Side, SleepEvent } from './entities';

/**
 * Pure session state machine: idle -> running(side) <-> paused; running -> running(otherSide).
 * Every transition is idempotent (double taps and duplicate notification actions are safe).
 */
export function startSession(input: { id: string; babyId: string; kind: SessionKind; side?: Side; now: Instant }): ActiveSession {
  return {
    id: input.id,
    babyId: input.babyId,
    kind: input.kind,
    status: 'running',
    startedAt: input.now,
    segments: [{ side: input.side, startedAt: input.now }],
    updatedAt: input.now,
  };
}

function closeOpen(session: ActiveSession, now: Instant): ActiveSession['segments'] {
  return session.segments.map((s) => (s.endedAt === undefined ? { ...s, endedAt: Math.max(now, s.startedAt) } : s));
}

export function currentSide(session: ActiveSession): Side | undefined {
  return session.segments[session.segments.length - 1]?.side;
}

export function switchSide(session: ActiveSession, side: Side, now: Instant): ActiveSession {
  if (session.status === 'running' && currentSide(session) === side) return session;
  const segments = [...closeOpen(session, now), { side, startedAt: now }];
  return { ...session, status: 'running', segments, updatedAt: now };
}

export function pauseSession(session: ActiveSession, now: Instant): ActiveSession {
  if (session.status === 'paused') return session;
  return { ...session, status: 'paused', segments: closeOpen(session, now), updatedAt: now };
}

export function resumeSession(session: ActiveSession, now: Instant): ActiveSession {
  if (session.status === 'running') return session;
  const segments = [...session.segments, { side: currentSide(session), startedAt: now }];
  return { ...session, status: 'running', segments, updatedAt: now };
}

/**
 * Moves the session start (the user tapped the timer late). Only the first segment changes; the new start
 * must be before that segment ends and not in the future. Returns the same object when nothing changes.
 */
export function backdateSession(session: ActiveSession, startedAt: Instant, now: Instant): ActiveSession {
  const [first, ...rest] = session.segments;
  if (!first) return session;
  const limit = Math.min(first.endedAt ?? now, now);
  if (startedAt >= limit || startedAt === first.startedAt) return session;
  return { ...session, startedAt, segments: [{ ...first, startedAt }, ...rest], updatedAt: now };
}

/** Fixes the starting side without creating a new segment (only while there is a single segment). */
export function correctStartSide(session: ActiveSession, side: Side, now: Instant): ActiveSession {
  const [only, ...rest] = session.segments;
  if (!only || rest.length > 0 || only.side === side) return session;
  return { ...session, segments: [{ ...only, side }], updatedAt: now };
}

/** Closes the session and builds the event to persist. Zero-length segments are dropped. */
export function finishSession(
  session: ActiveSession,
  input: { id: string; now: Instant },
): FeedingEvent | SleepEvent {
  const closed = closeOpen(session, input.now).filter((s) => (s.endedAt ?? s.startedAt) > s.startedAt);
  const endedAt = closed.reduce((max, s) => Math.max(max, s.endedAt ?? s.startedAt), session.startedAt);
  const base = {
    id: input.id,
    babyId: session.babyId,
    startedAt: session.startedAt,
    endedAt,
    createdAt: input.now,
    updatedAt: input.now,
    version: 1,
  };
  if (session.kind === 'sleep') return { ...base, kind: 'sleep' };
  const segments = closed.map((s) => ({ side: s.side ?? 'left', startedAt: s.startedAt, endedAt: s.endedAt ?? s.startedAt }));
  return { ...base, kind: 'feeding', method: 'breast', breast: { segments } };
}
