import { useI18n, type I18n } from '@/core/i18n';
import { toLocalDate, type LocalDate } from '@/core/time';
import type { Tone } from '@/design-system';

import { babyAge, type Baby, type BabyColor } from '../domain';
import { BabiesDeps } from './deps';

const toneByColor: Record<BabyColor, Tone> = {
  teal: 'brand',
  coral: 'feeding',
  indigo: 'sleep',
  green: 'health',
  amber: 'diaper',
};

export function babyTone(color: BabyColor): Tone {
  return toneByColor[color];
}

export function babyAgeLabel(baby: Pick<Baby, 'birthDate'>, today: LocalDate, i18n: I18n): string {
  const age = babyAge(baby.birthDate, today);
  if (age.days < 14) return i18n.t('units.ageDays', { count: age.days });
  if (age.months < 3) return i18n.t('units.ageWeeks', { count: age.weeks });
  return i18n.t('units.ageMonths', { count: age.months });
}

/** Age label using the injected clock (for screens that only need "x weeks old"). */
export function useBabyAgeLabel() {
  const { clock } = BabiesDeps.useDeps();
  const i18n = useI18n();
  const today = toLocalDate(clock.now());
  return (baby: Pick<Baby, 'birthDate'>) => babyAgeLabel(baby, today, i18n);
}
