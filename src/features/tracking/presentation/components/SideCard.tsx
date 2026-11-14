import { useI18n } from '@/core/i18n';
import { Badge, Card, Stack, Text, formatDuration } from '@/design-system';

import type { Side } from '../../domain';

export function SideCard({ side, ms, active, onPress }: { side: Side; ms: number; active: boolean; onPress: () => void }) {
  const { t } = useI18n();
  const name = t(`care.${side}`);
  return (
    <Stack flex>
      <Card
        tone={active ? 'feeding' : undefined}
        onPress={onPress}
        accessibilityLabel={active ? t('timer.runningSide', { side: name }) : t('timer.switchTo', { side: name })}>
        <Stack gap="xs" align="center">
          <Text variant="title2" color={active ? 'onFeedingSoft' : 'textPrimary'}>
            {name}
          </Text>
          <Text variant="timerSm" color={active ? 'onFeedingSoft' : 'textSecondary'}>
            {formatDuration(ms)}
          </Text>
          {active ? <Badge label={t('today.running')} tone="feeding" /> : null}
        </Stack>
      </Card>
    </Stack>
  );
}
