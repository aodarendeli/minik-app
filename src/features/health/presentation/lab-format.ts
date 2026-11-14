import type { I18n } from '@/core/i18n';
import type { IconName, Tone } from '@/design-system';
import { formatNumber } from '@/shared/format';

import type { LabCategory, LabResult, RangePosition } from '../domain';

/** Neutral on purpose: restating the lab sheet's own range, never a good/bad judgement (no green/red). */
export const positionTone: Record<RangePosition, Tone> = {
  below: 'info',
  within: 'neutral',
  above: 'info',
  noRange: 'neutral',
};

export const categoryIcon: Record<LabCategory, IconName> = {
  blood: 'blood',
  urine: 'lab',
  stool: 'lab',
  screening: 'health',
  hearing: 'info',
  other: 'lab',
};

export function formatRefRange(r: Pick<LabResult, 'refLow' | 'refHigh'>, i18n: I18n): string | undefined {
  const lo = r.refLow !== undefined ? formatNumber(r.refLow, i18n, 3) : undefined;
  const hi = r.refHigh !== undefined ? formatNumber(r.refHigh, i18n, 3) : undefined;
  if (lo && hi) return `${lo} – ${hi}`;
  if (lo) return `≥ ${lo}`;
  if (hi) return `≤ ${hi}`;
  return undefined;
}

export function formatResultValue(r: Pick<LabResult, 'value' | 'unit'>, i18n: I18n): string {
  return [formatNumber(r.value, i18n, 3), r.unit].filter(Boolean).join(' ');
}
