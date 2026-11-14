import { dayRanges, HOUR_MS, startOfLocalWeek } from '@/core/time';
import { build, NOON } from '@/test/builders';

import { buildReport } from './entities';

describe('buildReport', () => {
  const days = dayRanges(startOfLocalWeek(NOON), 7);

  it('aggregates per day, totals and per-day averages', () => {
    const at = days[1]?.from ?? 0;
    const model = buildReport({
      baby: build.baby(),
      period: 'week',
      days,
      events: [build.bottle(at + HOUR_MS, 140), build.diaper(at + 2 * HOUR_MS), { ...build.diaper(at), deletedAt: at }],
      labs: [],
      sections: ['log', 'feeding'],
      generatedAt: NOON,
    });
    expect(model.days).toHaveLength(7);
    expect(model.days[1]?.summary.feeding.bottleMl).toBe(140);
    expect(model.totals.diaper.total).toBe(1);
    expect(model.averages.feeds).toBeCloseTo(1 / 7);
    expect(model.sections).toEqual(['feeding', 'log']);
    expect(model.events).toHaveLength(2);
  });

  it('includes only labs inside the period', () => {
    const lab = { id: 'l', babyId: 'b1', category: 'blood' as const, title: 'x', results: [], createdAt: 0, updatedAt: 0, version: 1 };
    const model = buildReport({
      baby: build.baby(),
      period: 'week',
      days,
      events: [],
      labs: [{ ...lab, takenOn: days[0]?.date ?? '' }, { ...lab, id: 'old', takenOn: '2020-01-01' }],
      sections: ['labs'],
      generatedAt: NOON,
    });
    expect(model.labs.map((l) => l.id)).toEqual(['l']);
  });
});
