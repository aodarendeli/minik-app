import { HOUR_MS, MINUTE_MS, type Instant } from '@/core/time';
import type { Baby } from '@/features/babies/domain';
import type { CareEvent, DiaperType } from '@/features/tracking/domain';

/** Fixed local reference instant: 10 Nov 2026 12:00 device time. */
export const NOON = new Date(2026, 10, 10, 12, 0, 0).getTime();

let n = 0;
const meta = (babyId: string, startedAt: Instant) => ({
  id: `t-${++n}`,
  babyId,
  startedAt,
  createdAt: startedAt,
  updatedAt: startedAt,
  version: 1,
});

export const build = {
  baby: (over: Partial<Baby> = {}): Baby => ({
    id: 'b1',
    name: 'Deniz',
    birthDate: '2026-08-01',
    sex: 'unspecified',
    color: 'teal',
    createdAt: 0,
    updatedAt: 0,
    ...over,
  }),
  diaper: (at: Instant, type: DiaperType = 'wet', babyId = 'b1'): CareEvent => ({ ...meta(babyId, at), kind: 'diaper', type }),
  bottle: (at: Instant, amountMl: number, babyId = 'b1'): CareEvent => ({
    ...meta(babyId, at),
    kind: 'feeding',
    method: 'bottle',
    bottle: { amountMl, content: 'formula' },
  }),
  breast: (at: Instant, leftMin: number, rightMin: number, babyId = 'b1'): CareEvent => ({
    ...meta(babyId, at),
    endedAt: at + (leftMin + rightMin) * MINUTE_MS,
    kind: 'feeding',
    method: 'breast',
    breast: {
      segments: [
        { side: 'left', startedAt: at, endedAt: at + leftMin * MINUTE_MS },
        { side: 'right', startedAt: at + leftMin * MINUTE_MS, endedAt: at + (leftMin + rightMin) * MINUTE_MS },
      ],
    },
  }),
  sleep: (at: Instant, hours: number, babyId = 'b1'): CareEvent => ({
    ...meta(babyId, at),
    endedAt: at + hours * HOUR_MS,
    kind: 'sleep',
  }),
};
