import { sequentialIds } from '@/core/ids';
import { fixedClock, toLocalDate } from '@/core/time';
import { NOON } from '@/test/builders';

import { LocalBabyRepository } from '../data/baby.local-repository';
import { BABY_MAX, earliestBirthDate, validateBabyDraft } from './entities';
import { createBabyUseCases } from './use-cases';

const draft = (name: string, birthDate = '2026-08-01') => ({ name, birthDate, sex: 'unspecified' as const, color: 'teal' as const });

describe('baby rules', () => {
  it(`allows at most ${BABY_MAX} babies`, async () => {
    const uc = createBabyUseCases({ babies: new LocalBabyRepository(), clock: fixedClock(NOON), ids: sequentialIds() });
    for (let i = 0; i < BABY_MAX; i++) expect((await uc.createBaby(draft(`B${i}`))).ok).toBe(true);
    const over = await uc.createBaby(draft('Extra'));
    expect(over.ok === false && over.error.code).toBe('Limit');
  });

  it('rejects birth dates in the future or more than 6 years ago', () => {
    const today = toLocalDate(NOON);
    expect(earliestBirthDate('2026-11-10')).toBe('2020-11-10');
    expect(validateBabyDraft(draft('A', '2020-11-10'), today).ok).toBe(true);
    expect(validateBabyDraft(draft('A', '2020-11-09'), today).ok).toBe(false);
    expect(validateBabyDraft(draft('A', '2026-11-11'), today).ok).toBe(false);
  });
});
