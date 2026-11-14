import { addLocalDays, dayRange, HOUR_MS } from '@/core/time';
import { build, NOON } from '@/test/builders';

import { lastFeeding, suggestedNextSide, summarize } from './derived';
import type { FeedingEvent } from './entities';

describe('summarize', () => {
  it('counts feeds, bottle volume, breast time and diapers in range', () => {
    const range = dayRange(NOON);
    const s = summarize(
      [build.bottle(NOON, 120), build.bottle(NOON + HOUR_MS, 90), build.breast(NOON - 2 * HOUR_MS, 10, 5), build.diaper(NOON, 'dirty')],
      range,
    );
    expect(s.feeding).toMatchObject({ total: 3, bottle: 2, breast: 1, bottleMl: 210 });
    expect(s.feeding.breastMs).toBe(15 * 60_000);
    expect(s.diaper).toMatchObject({ total: 1, dirty: 1 });
  });

  it('clips sleep crossing midnight to each day', () => {
    const today = dayRange(NOON);
    const lateYesterday = today.from - 2 * HOUR_MS;
    const nap = build.sleep(lateYesterday, 5);
    expect(summarize([nap], today).sleep.totalMs).toBe(3 * HOUR_MS);
    expect(summarize([nap], dayRange(addLocalDays(NOON, -1))).sleep.totalMs).toBe(2 * HOUR_MS);
  });

  it('ignores soft-deleted events', () => {
    const deleted = { ...build.diaper(NOON), deletedAt: NOON };
    expect(summarize([deleted], dayRange(NOON)).diaper.total).toBe(0);
  });
});

describe('next side', () => {
  it('suggests the opposite of the last breast side', () => {
    const feeds = [build.breast(NOON - HOUR_MS * 5, 10, 10), build.breast(NOON, 10, 0)] as FeedingEvent[];
    const last = lastFeeding(feeds);
    expect(last?.startedAt).toBe(NOON);
    expect(suggestedNextSide(last)).toBe('right');
    expect(suggestedNextSide(undefined)).toBe('left');
  });
});
