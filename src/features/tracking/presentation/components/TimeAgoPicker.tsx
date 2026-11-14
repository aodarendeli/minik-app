import { useI18n } from '@/core/i18n';
import { Chip, ChipGroup, Stack, Text } from '@/design-system';

export const TIME_AGO_OPTIONS = [0, 15, 30, 60, 120] as const;
export type MinutesAgo = (typeof TIME_AGO_OPTIONS)[number];

/** "Now / 15 min ago / ..." chips for quick back-dating without a time picker. */
export function TimeAgoPicker({ value, onChange }: { value: MinutesAgo; onChange: (v: MinutesAgo) => void }) {
  const { t } = useI18n();
  const label = (m: MinutesAgo) =>
    m === 0 ? t('common.now') : m < 60 ? t('common.minutesAgo', { count: m }) : t('common.hoursAgo', { count: m / 60 });
  return (
    <Stack gap="sm">
      <Text variant="label" color="textSecondary">
        {t('common.when')}
      </Text>
      <ChipGroup>
        {TIME_AGO_OPTIONS.map((m) => (
          <Chip key={m} label={label(m)} selected={value === m} onPress={() => onChange(m)} tone="neutral" />
        ))}
      </ChipGroup>
    </Stack>
  );
}
