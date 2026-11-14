import { sequentialIds } from '@/core/ids';
import { dayRange, fixedClock, MINUTE_MS } from '@/core/time';
import { NOON } from '@/test/builders';

import { LocalActiveSessionRepository, LocalCareEventRepository } from '../data/tracking.local-repository';
import { createTrackingUseCases } from './use-cases';

function setup() {
  const clock = fixedClock(NOON);
  const events = new LocalCareEventRepository();
  const sessions = new LocalActiveSessionRepository();
  const presence = { show: jest.fn().mockResolvedValue(undefined), hide: jest.fn().mockResolvedValue(undefined) };
  const uc = createTrackingUseCases({ events, sessions, clock, ids: sequentialIds(), presence });
  return { clock, events, sessions, presence, uc };
}

describe('tracking use-cases', () => {
  it('stop persists the event and removes the session', async () => {
    const { clock, sessions, uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'breastFeeding', side: 'left' });
    clock.advance(12 * MINUTE_MS);
    const res = await uc.stopSession('b1', 'breastFeeding');
    expect(res.ok && res.value.event?.kind).toBe('feeding');
    expect(await sessions.listByBaby('b1')).toHaveLength(0);
    const day = await uc.getDayOverview('b1', dayRange(NOON));
    expect(day.ok && day.value.summary.feeding.breastMs).toBe(12 * MINUTE_MS);
    expect(day.ok && day.value.nextSide).toBe('right');
  });

  it('keeps the session when saving the event fails (no data loss)', async () => {
    const { clock, events, sessions, uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    clock.advance(5 * MINUTE_MS);
    jest.spyOn(events, 'add').mockRejectedValueOnce({ code: 'Storage' });
    const res = await uc.stopSession('b1', 'sleep');
    expect(res.ok).toBe(false);
    expect(await sessions.listByBaby('b1')).toHaveLength(1);
  });

  it('starting twice returns the existing session', async () => {
    const { uc } = setup();
    const a = await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    const b = await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    expect(a.ok && b.ok && a.value.id === b.value.id).toBe(true);
  });

  it('delete is soft and undoable', async () => {
    const { uc } = setup();
    const logged = await uc.logDiaper({ babyId: 'b1', type: 'wet' });
    if (!logged.ok) throw new Error('log failed');
    await uc.deleteEvent(logged.value.id);
    let list = await uc.listEvents('b1', dayRange(NOON));
    expect(list.ok && list.value).toHaveLength(0);
    await uc.restoreEvent(logged.value.id);
    list = await uc.listEvents('b1', dayRange(NOON));
    expect(list.ok && list.value).toHaveLength(1);
  });

  it('rejects out-of-range bottle amounts and future times are clamped to now', async () => {
    const { uc } = setup();
    expect((await uc.logBottle({ babyId: 'b1', amountMl: 0, content: 'formula' })).ok).toBe(false);
    const res = await uc.logBottle({ babyId: 'b1', amountMl: 120, content: 'formula', at: NOON + 60 * MINUTE_MS });
    expect(res.ok && res.value.startedAt).toBe(NOON);
  });

  it('shows presence on every state change and hides it on stop', async () => {
    const { clock, presence, uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'breastFeeding', side: 'left' });
    clock.advance(MINUTE_MS);
    await uc.switchSide('b1', 'right');
    await uc.switchSide('b1', 'right'); // duplicate tap: no extra update
    await uc.pauseSession('b1', 'breastFeeding');
    expect(presence.show).toHaveBeenCalledTimes(3);
    const stopped = await uc.stopSession('b1', 'breastFeeding');
    expect(stopped.ok && stopped.value.event).toBeTruthy();
    expect(presence.hide).toHaveBeenCalledTimes(1);
  });

  it('a failing notification never breaks the timer', async () => {
    const { presence, uc } = setup();
    presence.show.mockRejectedValue(new Error('denied'));
    const res = await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    expect(res.ok).toBe(true);
  });

  it('sessions shorter than 30 s are discarded, not saved', async () => {
    const { clock, sessions, uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    clock.advance(20_000);
    const res = await uc.stopSession('b1', 'sleep');
    expect(res.ok && res.value).toEqual({ event: null, tooShort: true });
    expect(await sessions.listAll()).toHaveLength(0);
    const list = await uc.listEvents('b1', dayRange(NOON));
    expect(list.ok && list.value).toHaveLength(0);
  });

  it('"started 10 min ago" moves the start back and is capped at 3 hours', async () => {
    const { uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    const res = await uc.setStartedMinutesAgo('b1', 'sleep', 10);
    expect(res.ok && res.value.startedAt).toBe(NOON - 10 * MINUTE_MS);
    const capped = await uc.setStartedMinutesAgo('b1', 'sleep', 600);
    expect(capped.ok && capped.value.startedAt).toBe(NOON - 180 * MINUTE_MS);
  });

  it('restorePresence re-posts every persisted session', async () => {
    const { presence, uc } = setup();
    await uc.startSession({ babyId: 'b1', kind: 'sleep' });
    await uc.startSession({ babyId: 'b2', kind: 'breastFeeding', side: 'left' });
    presence.show.mockClear();
    const res = await uc.restorePresence();
    expect(res.ok && res.value).toBe(2);
    expect(presence.show).toHaveBeenCalledTimes(2);
  });

  it('caps solid food items (count and length)', async () => {
    const { uc } = setup();
    const tooMany = await uc.logSolid({ babyId: 'b1', items: Array.from({ length: 11 }, (_, i) => `f${i}`) });
    expect(tooMany.ok === false && tooMany.error.code).toBe('Limit');
    const long = await uc.logSolid({ babyId: 'b1', items: ['x'.repeat(100)] });
    expect(long.ok && long.value.kind === 'feeding' && long.value.solid?.items[0]).toHaveLength(40);
  });
});
