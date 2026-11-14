import { sequentialIds } from '@/core/ids';
import { fixedClock, fromLocalDate, HOUR_MS } from '@/core/time';
import { NOON } from '@/test/builders';

import { LocalRecordRepository } from '../data/record.local-repository';
import { createRecordUseCases, latestGrowth, REMINDER_HOUR, validateGrowthDraft, type GrowthEntry, type MedEntry } from './records';

function setup() {
  const reminders = { schedule: jest.fn().mockResolvedValue(undefined), cancel: jest.fn().mockResolvedValue(undefined) };
  const uc = createRecordUseCases({
    growth: new LocalRecordRepository<GrowthEntry>(),
    meds: new LocalRecordRepository<MedEntry>(),
    reminders,
    clock: fixedClock(NOON),
    ids: sequentialIds(),
  });
  return { uc, reminders };
}

describe('growth', () => {
  it('needs at least one plausible value and no future date', () => {
    const base = { babyId: 'b1', measuredOn: '2026-11-01' };
    expect(validateGrowthDraft(base, '2026-11-10').ok).toBe(false);
    expect(validateGrowthDraft({ ...base, weightKg: 45 }, '2026-11-10').ok).toBe(false);
    expect(validateGrowthDraft({ ...base, weightKg: Number.NaN }, '2026-11-10').ok).toBe(false);
    expect(validateGrowthDraft({ ...base, measuredOn: '2026-11-11', weightKg: 5 }, '2026-11-10').ok).toBe(false);
    expect(validateGrowthDraft({ ...base, weightKg: 5.2 }, '2026-11-10').ok).toBe(true);
  });

  it('latest value per metric, even when entries hold different metrics', () => {
    const e = (on: string, v: Partial<GrowthEntry>) => ({ id: on, babyId: 'b1', measuredOn: on, createdAt: 0, updatedAt: 0, version: 1, ...v });
    const l = latestGrowth([e('2026-10-01', { weightKg: 4, heightCm: 54 }), e('2026-11-01', { weightKg: 5 })]);
    expect(l.weightKg).toEqual({ value: 5, on: '2026-11-01' });
    expect(l.heightCm).toEqual({ value: 54, on: '2026-10-01' });
  });
});

describe('vaccines and medicines', () => {
  it('schedules a reminder at 09:00 on the next date and cancels it on delete', async () => {
    const { uc, reminders } = setup();
    const res = await uc.saveMed({ babyId: 'b1', kind: 'vaccine', name: ' Hepatit B ', givenOn: '2026-11-10', nextOn: '2026-12-10' });
    expect(res.ok && res.value.name).toBe('Hepatit B');
    expect(reminders.schedule).toHaveBeenCalledWith(
      expect.objectContaining({ at: fromLocalDate('2026-12-10') + REMINDER_HOUR * HOUR_MS, kind: 'vaccine', name: 'Hepatit B' }),
    );
    if (!res.ok) throw new Error('save failed');
    reminders.schedule.mockClear();
    await uc.deleteMed(res.value.id);
    expect(reminders.cancel).toHaveBeenCalledWith(res.value.id);
    expect(reminders.schedule).not.toHaveBeenCalled();
    expect((await uc.listMeds('b1')).ok && (await uc.listMeds('b1'))).toMatchObject({ value: [] });
  });

  it('rejects a next date before the given date; a failing reminder never blocks saving', async () => {
    const { uc, reminders } = setup();
    expect((await uc.saveMed({ babyId: 'b1', kind: 'medication', name: 'D', givenOn: '2026-11-10', nextOn: '2026-11-09' })).ok).toBe(false);
    reminders.schedule.mockRejectedValue(new Error('denied'));
    expect((await uc.saveMed({ babyId: 'b1', kind: 'medication', name: 'D', givenOn: '2026-11-10', nextOn: '2026-11-20' })).ok).toBe(true);
  });
});
