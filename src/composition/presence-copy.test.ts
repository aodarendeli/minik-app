import { sequentialIds } from '@/core/ids';
import { memoryStorage } from '@/core/storage/key-value';
import { fixedClock, MINUTE_MS } from '@/core/time';
import type { DescribeSession } from '@/platform/session-presence.types';
import { NOON } from '@/test/builders';

import { createContainer } from './container';

jest.mock('@/platform/pdf-exporter', () => ({ expoPdfExporter: {} }));
jest.mock('@/platform/storage', () => ({ deviceStorage: null }));
jest.mock('@/platform/session-presence', () => ({ createSessionPresence: jest.fn() }));

function setup() {
  let describe: DescribeSession | undefined;
  const clock = fixedClock(NOON);
  const presence = (d: DescribeSession) => {
    describe = d;
    return { configure: jest.fn(), show: jest.fn().mockResolvedValue(undefined), hide: jest.fn(), subscribe: jest.fn() };
  };
  const c = createContainer({ clock, ids: sequentialIds(), storage: memoryStorage(), presence, seedDemoData: true });
  if (!describe) throw new Error('describe not captured');
  return { c, clock, describe };
}

const time = (at: number) => new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(at);

describe('notification copy', () => {
  it('running feed: current side as subtitle, start time and finished sides in body', async () => {
    const { c, clock, describe } = setup();
    await c.tracking.startSession({ babyId: 'baby-demo', kind: 'breastFeeding', side: 'left' });
    clock.advance(8 * MINUTE_MS);
    const switched = await c.tracking.switchSide('baby-demo', 'right');
    if (!switched.ok) throw new Error('switch failed');
    const copy = await describe(switched.value);
    expect(copy.title).toBe('🤱 Deniz · Emzirme');
    expect(copy.subtitle).toBe('Şu an Sağ taraf');
    expect(copy.body).toBe(`Başlangıç ${time(NOON)} · Sol 8 dk tamamlandı`);
  });

  it('paused feed shows stable totals per side', async () => {
    const { c, clock, describe } = setup();
    await c.tracking.startSession({ babyId: 'baby-demo', kind: 'breastFeeding', side: 'left' });
    clock.advance(8 * MINUTE_MS);
    await c.tracking.switchSide('baby-demo', 'right');
    clock.advance(4 * MINUTE_MS);
    const paused = await c.tracking.pauseSession('baby-demo', 'breastFeeding');
    if (!paused.ok) throw new Error('pause failed');
    clock.advance(30 * MINUTE_MS);
    const copy = await describe(paused.value);
    expect(copy.title).toBe('⏸️ Deniz · Emzirme duraklatıldı');
    expect(copy.body).toBe('Toplam 12 dk · Sol 8 dk · Sağ 4 dk');
  });

  it('sleep', async () => {
    const { c, describe } = setup();
    const s = await c.tracking.startSession({ babyId: 'baby-demo', kind: 'sleep' });
    if (!s.ok) throw new Error('start failed');
    const copy = await describe(s.value);
    expect(copy.title).toBe('🌙 Deniz uyuyor');
    expect(copy.body).toBe(`Başlangıç ${time(NOON)}`);
  });

  it('delete all can be undone in-session, and sample data can be reloaded', async () => {
    const { c } = setup();
    const before = await c.babies.listBabies();
    const undo = await c.clearAllData();
    const empty = await c.babies.listBabies();
    expect(empty.ok && empty.value).toHaveLength(0);
    await undo();
    const restored = await c.babies.listBabies();
    expect(restored.ok && before.ok && restored.value).toEqual(before.ok ? before.value : []);
    await c.clearAllData();
    c.loadDemoData();
    const reloaded = await c.babies.listBabies();
    expect(reloaded.ok && reloaded.value.map((b) => b.name)).toEqual(['Deniz']);
  });

  it('deleting a baby removes only its data and can be undone', async () => {
    const { c } = setup();
    const twin = await c.babies.createBaby({ name: 'Ada', birthDate: '2026-10-01', sex: 'girl', color: 'coral' });
    if (!twin.ok) throw new Error('create failed');
    await c.tracking.logDiaper({ babyId: twin.value.id, type: 'wet' });
    await c.tracking.startSession({ babyId: 'baby-demo', kind: 'sleep' });
    const range = { from: 0, to: NOON + 1 };
    const demoEvents = await c.tracking.listEvents('baby-demo', range);

    const undo = await c.deleteBaby('baby-demo');
    const left = await c.babies.listBabies();
    expect(left.ok && left.value.map((b) => b.name)).toEqual(['Ada']);
    const gone = await c.tracking.listEvents('baby-demo', range);
    expect(gone.ok && gone.value).toHaveLength(0);
    const kept = await c.tracking.listEvents(twin.value.id, range);
    expect(kept.ok && kept.value).toHaveLength(1);
    const session = await c.tracking.getSession('baby-demo', 'sleep');
    expect(session.ok && session.value).toBeNull();

    await undo();
    const back = await c.tracking.listEvents('baby-demo', range);
    expect(back.ok && demoEvents.ok && back.value.length).toBe(demoEvents.ok ? demoEvents.value.length : -1);
  });
});
