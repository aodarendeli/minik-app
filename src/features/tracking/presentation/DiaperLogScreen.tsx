import { useI18n } from '@/core/i18n';
import { ActionTile, Inline, ScreenContainer, Stack, Text, TextField } from '@/design-system';
import { formatError } from '@/shared/format';

import type { DiaperType } from '../domain';
import { TimeAgoPicker } from './components/TimeAgoPicker';
import { useLogViewModel, useTrackingUseCases } from './use-log-view-model';

const TYPES: readonly DiaperType[] = ['wet', 'dirty', 'mixed', 'dry'];

/** Second tap saves: choosing a type logs immediately. */
export function DiaperLogScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const useCases = useTrackingUseCases();
  const vm = useLogViewModel<DiaperType>(
    ({ babyId, at, note, args }) => useCases.logDiaper({ babyId, type: args, at, note }),
    t('log.diaperSaved'),
  );
  return (
    <ScreenContainer>
      <TimeAgoPicker value={vm.minutesAgo} onChange={vm.setMinutesAgo} />
      <TextField
        label={`${t('common.note')} (${t('common.optional')})`}
        value={vm.note}
        onChangeText={vm.setNote}
        placeholder={t('common.notePlaceholder')}
      />
      <Stack gap="sm">
        <Text variant="label" color="textSecondary">
          {t('log.diaperPrompt')}
        </Text>
        <Inline gap="sm" wrap align="stretch">
          {TYPES.map((type) => (
            <ActionTile
              key={type}
              icon="diaper"
              tone="diaper"
              label={t(`care.diaperType.${type}`)}
              onPress={() => vm.save(type)}
              testID={`diaper-${type}`}
            />
          ))}
        </Inline>
      </Stack>
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
    </ScreenContainer>
  );
}
