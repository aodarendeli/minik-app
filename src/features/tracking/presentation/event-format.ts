import type { I18n } from '@/core/i18n';
import type { IconName, Tone } from '@/design-system';
import { formatDurationShort } from '@/shared/format';

import { eventDurationMs, sideDurations, type CareEvent } from '../domain';

export type EventDescription = { icon: IconName; tone: Tone; title: string; detail: string };

/** Human-readable description of a care event; shared by lists and the PDF report. */
export function describeEvent(event: CareEvent, i18n: I18n): EventDescription {
  const { t } = i18n;
  switch (event.kind) {
    case 'diaper':
      return { icon: 'diaper', tone: 'diaper', title: t('care.diaper'), detail: t(`care.diaperType.${event.type}`) };
    case 'sleep':
      return {
        icon: 'sleep',
        tone: 'sleep',
        title: t('care.sleep'),
        detail: event.endedAt ? formatDurationShort(eventDurationMs(event), i18n) : t('care.sleepOngoing'),
      };
    case 'feeding': {
      if (event.method === 'bottle' && event.bottle) {
        return {
          icon: 'bottle',
          tone: 'feeding',
          title: t('care.bottle'),
          detail: `${event.bottle.amountMl} ${t('units.ml')} · ${t(`care.bottleContent.${event.bottle.content}`)}`,
        };
      }
      if (event.method === 'solid') {
        return { icon: 'solid', tone: 'health', title: t('care.solid'), detail: event.solid?.items.join(', ') ?? '' };
      }
      const { leftMs, rightMs } = sideDurations(event.breast?.segments ?? [], event.startedAt);
      return {
        icon: 'breast',
        tone: 'feeding',
        title: t('care.breast'),
        detail: t('care.breastDetail', { left: formatDurationShort(leftMs, i18n), right: formatDurationShort(rightMs, i18n) }),
      };
    }
  }
}
