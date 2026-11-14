import { useI18n } from '@/core/i18n';
import { Badge, ListItem, type IconName } from '@/design-system';
import { formatDate } from '@/shared/format';

import type { LabTest } from '../../domain';

export function LabTestRow({ test, icon, outside, onPress }: { test: LabTest; icon: IconName; outside: number; onPress: () => void }) {
  const i18n = useI18n();
  const { t } = i18n;
  const subtitle = [
    formatDate(test.takenOn, i18n, 'long'),
    t(`health.category.${test.category}`),
    test.results.length > 0 ? t('health.valuesCount', { count: test.results.length }) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <ListItem
      icon={icon}
      tone="health"
      title={test.title}
      subtitle={subtitle}
      onPress={onPress}
      showChevron
      trailing={outside > 0 ? <Badge label={t('health.outsideCount', { count: outside })} tone="neutral" /> : undefined}
    />
  );
}
