import { seededRandom } from '@/core/random';
import { addLocalDays, MINUTE_MS, startOfLocalDay, type Instant } from '@/core/time';

import type { CareEvent, DiaperType, Side } from '../domain';

/** Deterministic, realistic-looking history for demos and screenshots (feeds ~every 3h, diapers, naps). */
export function demoCareEvents(babyId: string, now: Instant, days = 14): CareEvent[] {
  const rnd = seededRandom(42);
  const out: CareEvent[] = [];
  let n = 0;
  const meta = (startedAt: Instant) => ({ id: `fx-${++n}`, babyId, startedAt, createdAt: startedAt, updatedAt: startedAt, version: 1 });
  let t = addLocalDays(startOfLocalDay(now), -days) + 30 * MINUTE_MS;
  let side: Side = 'left';
  const diaperTypes: DiaperType[] = ['wet', 'wet', 'wet', 'dirty', 'mixed'];
  while (t < now - 20 * MINUTE_MS) {
    let feedEnd = t;
    if (rnd.chance(0.75)) {
      const first = rnd.between(8, 16) * MINUTE_MS;
      const second = rnd.between(5, 14) * MINUTE_MS;
      const other: Side = side === 'left' ? 'right' : 'left';
      const segments = [
        { side, startedAt: t, endedAt: t + first },
        { side: other, startedAt: t + first, endedAt: t + first + second },
      ];
      feedEnd = t + first + second;
      out.push({ ...meta(t), endedAt: feedEnd, kind: 'feeding', method: 'breast', breast: { segments } });
      side = other;
    } else {
      out.push({ ...meta(t), kind: 'feeding', method: 'bottle', bottle: { amountMl: rnd.between(6, 15) * 10, content: rnd.chance(0.5) ? 'breastMilk' : 'formula' } });
      feedEnd = t + 15 * MINUTE_MS;
    }
    if (rnd.chance(0.8)) {
      out.push({ ...meta(feedEnd + 5 * MINUTE_MS), kind: 'diaper', type: diaperTypes[rnd.between(0, diaperTypes.length - 1)] ?? 'wet' });
    }
    const gap = rnd.between(150, 210) * MINUTE_MS;
    const sleepStart = feedEnd + 15 * MINUTE_MS;
    const sleepEnd = t + gap - 15 * MINUTE_MS;
    if (rnd.chance(0.75) && sleepEnd < now && sleepEnd > sleepStart) {
      out.push({ ...meta(sleepStart), endedAt: sleepEnd, kind: 'sleep' });
    }
    t += gap;
  }
  return out;
}
