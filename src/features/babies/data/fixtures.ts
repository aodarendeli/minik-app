import { addLocalDays, toLocalDate, type Instant } from '@/core/time';

import type { Baby } from '../domain';

export const DEMO_BABY_ID = 'baby-demo';
export const DEMO_BABY_AGE_DAYS = 95;

export function demoBabies(now: Instant): Baby[] {
  const created = addLocalDays(now, -DEMO_BABY_AGE_DAYS);
  return [
    {
      id: DEMO_BABY_ID,
      name: 'Deniz',
      birthDate: toLocalDate(created),
      sex: 'unspecified',
      color: 'teal',
      createdAt: created,
      updatedAt: created,
    },
  ];
}
