import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { Button, ScreenContainer, Text, TextField } from '@/design-system';
import { formatError } from '@/shared/format';

import { TimeAgoPicker } from './components/TimeAgoPicker';
import { useLogViewModel, useTrackingUseCases } from './use-log-view-model';

export function SolidLogScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const useCases = useTrackingUseCases();
  const [items, setItems] = useState('');
  const vm = useLogViewModel<null>(
    ({ babyId, at, note }) => useCases.logSolid({ babyId, items: items.split(','), at, note }),
    t('log.solidSaved'),
  );
  return (
    <ScreenContainer
      footer={
        <Button
          label={t('common.save')}
          onPress={() => vm.save(null)}
          loading={vm.saving}
          disabled={items.trim().length === 0}
          tone="health"
          fullWidth
          size="lg"
        />
      }>
      <TextField
        label={t('log.solidItems')}
        helper={t('log.solidItemsHelper')}
        placeholder={t('log.solidItemsPlaceholder')}
        value={items}
        onChangeText={setItems}
        autoFocus
      />
      <TimeAgoPicker value={vm.minutesAgo} onChange={vm.setMinutesAgo} />
      <TextField
        label={`${t('common.note')} (${t('common.optional')})`}
        value={vm.note}
        onChangeText={vm.setNote}
        placeholder={t('common.notePlaceholder')}
      />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
    </ScreenContainer>
  );
}
