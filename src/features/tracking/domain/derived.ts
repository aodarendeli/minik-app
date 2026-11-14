import { overlapMs, type Instant, type TimeRange } from '@/core/time';

import type { ActiveSession, CareEvent, DiaperType, FeedingEvent, Side } from './entities';

export function elapsedMs(session: ActiveSession, now: Instant): number {
  return session.segments.reduce((sum, s) => sum + Math.max(0, (s.endedAt ?? now) - s.startedAt), 0);
}

export function sideDurations(segments: readonly { side?: Side; startedAt: Instant; endedAt?: Instant }[], now: Instant) {
  let leftMs = 0;
  let rightMs = 0;
  for (const s of segments) {
    const d = Math.max(0, (s.endedAt ?? now) - s.startedAt);
    if (s.side === 'left') leftMs += d;
    if (s.side === 'right') rightMs += d;
  }
  return { leftMs, rightMs };
}

export function eventDurationMs(event: CareEvent): number {
  if (event.kind === 'feeding' && event.breast) {
    const { leftMs, rightMs } = sideDurations(event.breast.segments, event.startedAt);
    return leftMs + rightMs;
  }
  return event.endedAt ? Math.max(0, event.endedAt - event.startedAt) : 0;
}

export function isActive(event: CareEvent): boolean {
  return event.deletedAt === undefined;
}

export function lastFeeding(events: readonly CareEvent[]): FeedingEvent | undefined {
  return events
    .filter((e): e is FeedingEvent => e.kind === 'feeding' && isActive(e))
    .reduce<FeedingEvent | undefined>((last, e) => (!last || e.startedAt > last.startedAt ? e : last), undefined);
}

/** Side of the last segment that actually lasted (zero-length segments are ignored). */
export function lastBreastSide(feeding: FeedingEvent | undefined): Side | undefined {
  const segments = (feeding?.breast?.segments ?? []).filter((s) => s.endedAt > s.startedAt);
  return segments[segments.length - 1]?.side;
}

/** Suggests the opposite of the last breast side (left when unknown). */
export function suggestedNextSide(lastBreastFeeding: FeedingEvent | undefined): Side {
  return lastBreastSide(lastBreastFeeding) === 'left' ? 'right' : 'left';
}

export type CareSummary = {
  feeding: { total: number; breast: number; bottle: number; solid: number; breastMs: number; leftMs: number; rightMs: number; bottleMl: number };
  diaper: { total: number } & Record<DiaperType, number>;
  sleep: { count: number; totalMs: number; longestMs: number };
};

export function emptySummary(): CareSummary {
  return {
    feeding: { total: 0, breast: 0, bottle: 0, solid: 0, breastMs: 0, leftMs: 0, rightMs: 0, bottleMl: 0 },
    diaper: { total: 0, wet: 0, dirty: 0, mixed: 0, dry: 0 },
    sleep: { count: 0, totalMs: 0, longestMs: 0 },
  };
}

/**
 * Descriptive totals for a range. Point events count when they start inside the range;
 * sleep duration is clipped to the range so naps crossing midnight split correctly.
 */
export function summarize(events: readonly CareEvent[], range: TimeRange): CareSummary {
  const s = emptySummary();
  const inRange = (at: Instant) => at >= range.from && at < range.to;
  for (const e of events) {
    if (!isActive(e)) continue;
    if (e.kind === 'sleep') {
      const ms = overlapMs(range, e.startedAt, e.endedAt ?? e.startedAt);
      if (ms <= 0) continue;
      s.sleep.count += inRange(e.startedAt) ? 1 : 0;
      s.sleep.totalMs += ms;
      s.sleep.longestMs = Math.max(s.sleep.longestMs, ms);
    } else if (inRange(e.startedAt)) {
      if (e.kind === 'diaper') {
        s.diaper.total += 1;
        s.diaper[e.type] += 1;
      } else {
        addFeeding(s, e);
      }
    }
  }
  return s;
}

function addFeeding(s: CareSummary, e: FeedingEvent) {
  s.feeding.total += 1;
  s.feeding[e.method] += 1;
  if (e.breast) {
    const { leftMs, rightMs } = sideDurations(e.breast.segments, e.startedAt);
    s.feeding.leftMs += leftMs;
    s.feeding.rightMs += rightMs;
    s.feeding.breastMs += leftMs + rightMs;
  }
  if (e.bottle) s.feeding.bottleMl += e.bottle.amountMl;
}

export function sortByStartDesc<T extends { startedAt: Instant }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.startedAt - a.startedAt);
}
