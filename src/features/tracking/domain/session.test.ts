import { MINUTE_MS } from '@/core/time';

import { elapsedMs, sideDurations } from './derived';
import { backdateSession, correctStartSide, finishSession, pauseSession, resumeSession, startSession, switchSide } from './session';

const T0 = 1_000_000;
const start = () => startSession({ id: 's1', babyId: 'b1', kind: 'breastFeeding', side: 'left', now: T0 });

describe('session state machine', () => {
  it('derives elapsed time from timestamps, excluding paused time', () => {
    let s = start();
    s = pauseSession(s, T0 + 5 * MINUTE_MS);
    s = resumeSession(s, T0 + 15 * MINUTE_MS);
    expect(elapsedMs(s, T0 + 20 * MINUTE_MS)).toBe(10 * MINUTE_MS);
  });

  it('switching side closes the current segment and opens a new one', () => {
    const s = switchSide(start(), 'right', T0 + 7 * MINUTE_MS);
    expect(s.segments).toHaveLength(2);
    expect(sideDurations(s.segments, T0 + 10 * MINUTE_MS)).toEqual({ leftMs: 7 * MINUTE_MS, rightMs: 3 * MINUTE_MS });
  });

  it('is idempotent for duplicate actions', () => {
    const s = start();
    expect(switchSide(s, 'left', T0 + MINUTE_MS)).toBe(s);
    const paused = pauseSession(s, T0 + MINUTE_MS);
    expect(pauseSession(paused, T0 + 2 * MINUTE_MS)).toBe(paused);
    expect(resumeSession(s, T0 + MINUTE_MS)).toBe(s);
  });

  it('finishing builds a breast feeding event and drops zero-length segments', () => {
    let s = start();
    s = switchSide(s, 'right', T0 + 10 * MINUTE_MS);
    s = switchSide(s, 'left', T0 + 10 * MINUTE_MS);
    const event = finishSession(s, { id: 'e1', now: T0 + 12 * MINUTE_MS });
    expect(event.kind).toBe('feeding');
    if (event.kind !== 'feeding') return;
    expect(event.breast?.segments.map((x) => x.side)).toEqual(['left', 'left']);
    expect(event.endedAt).toBe(T0 + 12 * MINUTE_MS);
  });

  it('finishing a paused session ends at the pause, not at stop time', () => {
    const s = pauseSession(start(), T0 + 8 * MINUTE_MS);
    const event = finishSession(s, { id: 'e1', now: T0 + 60 * MINUTE_MS });
    expect(event.endedAt).toBe(T0 + 8 * MINUTE_MS);
  });
});

describe('start corrections', () => {
  it('backdates the first segment, never into the future or past its end', () => {
    const s = start();
    const now = T0 + MINUTE_MS;
    const back = backdateSession(s, T0 - 5 * MINUTE_MS, now);
    expect(back.startedAt).toBe(T0 - 5 * MINUTE_MS);
    expect(elapsedMs(back, now)).toBe(6 * MINUTE_MS);
    expect(backdateSession(s, now + MINUTE_MS, now)).toBe(s);
    const switched = switchSide(s, 'right', T0 + 2 * MINUTE_MS);
    expect(backdateSession(switched, T0 + 3 * MINUTE_MS, T0 + 4 * MINUTE_MS)).toBe(switched);
  });

  it('corrects the starting side only while there is a single segment', () => {
    const s = start();
    expect(correctStartSide(s, 'right', T0 + 1000).segments).toEqual([{ side: 'right', startedAt: T0 }]);
    const switched = switchSide(s, 'right', T0 + MINUTE_MS);
    expect(correctStartSide(switched, 'left', T0 + 2 * MINUTE_MS)).toBe(switched);
  });
});
