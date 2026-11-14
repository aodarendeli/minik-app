import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import {
  Button,
  Chip,
  ChipGroup,
  NumberStepper,
  ScreenContainer,
  SegmentedControl,
  Stack,
  Text,
  TextField,
} from '@/design-system';
import { formatError } from '@/shared/format';

import { BOTTLE_MAX_ML, type BottleContent } from '../domain';
import { TimeAgoPicker } from './components/TimeAgoPicker';
import { useLogViewModel, useTrackingUseCases } from './use-log-view-model';

const QUICK_AMOUNTS = [60, 90, 120, 150, 180] as const;
const CONTENTS: readonly BottleContent[] = ['breastMilk', 'formula', 'other'];

export function BottleLogScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const useCases = useTrackingUseCases();
  const [amount, setAmount] = useState(90);
  const [content, setContent] = useState<BottleContent>('breastMilk');
  const vm = useLogViewModel<null>(
    ({ babyId, at, note }) => useCases.logBottle({ babyId, amountMl: amount, content, at, note }),
    t('log.bottleSaved'),
  );
  return (
    <ScreenContainer
      footer={<Button label={t('common.save')} onPress={() => vm.save(null)} loading={vm.saving} tone="feeding" fullWidth size="lg" />}>
      <Stack gap="sm">
        <NumberStepper
          label={t('log.amount')}
          value={amount}
          onChange={setAmount}
          step={10}
          min={10}
          max={BOTTLE_MAX_ML}
          unit={t('units.ml')}
          decrementLabel={t('common.decrease')}
          incrementLabel={t('common.increase')}
        />
        <ChipGroup>
          {QUICK_AMOUNTS.map((ml) => (
            <Chip key={ml} label={`${ml} ${t('units.ml')}`} selected={amount === ml} tone="feeding" onPress={() => setAmount(ml)} />
          ))}
        </ChipGroup>
      </Stack>
      <Stack gap="sm">
        <Text variant="label" color="textSecondary">
          {t('log.content')}
        </Text>
        <SegmentedControl
          accessibilityLabel={t('log.content')}
          value={content}
          onChange={setContent}
          options={CONTENTS.map((c) => ({ value: c, label: t(`care.bottleContent.${c}`) }))}
        />
      </Stack>
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
