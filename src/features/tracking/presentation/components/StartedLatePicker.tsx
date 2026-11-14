import { useI18n } from '@/core/i18n';
import { Chip, ChipGroup, Stack, Text } from '@/design-system';

/** "Started late? 2 / 5 / 10 / 15 min ago" — moves the session start back in one tap. */
export function StartedLatePicker({ options, onPick }: { options: readonly number[]; onPick: (minutes: number) => void }) {
  const { t } = useI18n();
  return (
    <Stack gap="sm">
      <Text variant="label" color="textSecondary">
        {t('timer.startedLate')}
      </Text>
      <ChipGroup>
        {options.map((m) => (
          <Chip key={m} label={t('timer.startedAgo', { count: m })} icon="history" tone="neutral" onPress={() => onPick(m)} />
        ))}
      </ChipGroup>
    </Stack>
  );
}
