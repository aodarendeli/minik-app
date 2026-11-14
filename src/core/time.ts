/** Epoch milliseconds, UTC. The only time representation stored or passed around. */
export type Instant = number;

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export type Clock = { now(): Instant };

export const systemClock: Clock = { now: () => Date.now() };

export function fixedClock(at: Instant): Clock & { set(at: Instant): void; advance(ms: number): void } {
  let current = at;
  return {
    now: () => current,
    set: (next) => {
      current = next;
    },
    advance: (ms) => {
      current += ms;
    },
  };
}

/** Calendar date in the device time zone, `YYYY-MM-DD`. */
export type LocalDate = string;

export type TimeRange = { from: Instant; to: Instant };

/** A calendar day and its [from, to) instant range in the device time zone (DST-safe). */
export type DayRange = TimeRange & { date: LocalDate };

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalDate(at: Instant): LocalDate {
  const d = new Date(at);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromLocalDate(date: LocalDate): Instant {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1).getTime();
}

export function startOfLocalDay(at: Instant): Instant {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Adds calendar days keeping local midnight across DST changes. */
export function addLocalDays(at: Instant, days: number): Instant {
  const d = new Date(at);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Monday-based week start. */
export function startOfLocalWeek(at: Instant): Instant {
  const start = startOfLocalDay(at);
  const weekday = (new Date(start).getDay() + 6) % 7;
  return addLocalDays(start, -weekday);
}

export function dayRange(at: Instant): DayRange {
  const from = startOfLocalDay(at);
  return { date: toLocalDate(from), from, to: addLocalDays(from, 1) };
}

/** Consecutive day ranges covering [from, from + count days). */
export function dayRanges(from: Instant, count: number): DayRange[] {
  return Array.from({ length: count }, (_, i) => dayRange(addLocalDays(startOfLocalDay(from), i)));
}

export function overlapMs(range: TimeRange, start: Instant, end: Instant): number {
  return Math.max(0, Math.min(range.to, end) - Math.max(range.from, start));
}

/** API wire format (ISO-8601 UTC) <-> Instant. Used only at data boundaries. */
export function toIsoString(at: Instant): string {
  return new Date(at).toISOString();
}

/** Returns NaN for an unparseable string; callers validate the shape first (zod). */
export function fromIsoString(iso: string): Instant {
  return Date.parse(iso);
}
