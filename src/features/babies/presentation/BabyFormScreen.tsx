import { Stack as RouterStack } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { Button, Chip, ChipGroup, DateField, Notice, ScreenContainer, Stack, Text, TextField } from '@/design-system';
import { formatDate, formatError } from '@/shared/format';

import { BABY_NAME_MAX, type BabySex } from '../domain';
import { babyTone } from './baby-format';
import { useBabyFormViewModel } from './use-baby-form';

type BabyFormVm = ReturnType<typeof useBabyFormViewModel>;

const SEXES: readonly BabySex[] = ['girl', 'boy', 'unspecified'];

export function BabyFormScreen({ editId }: { editId?: string }) {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useBabyFormViewModel(editId);
  return (
    <>
      <RouterStack.Screen options={{ title: t(vm.isEdit ? 'babyForm.editTitle' : 'babyForm.newTitle') }} />
      <ScreenContainer
        footer={
          <>
            <Button label={t('common.save')} onPress={vm.save} loading={vm.saving} disabled={vm.atLimit} fullWidth size="lg" />
            {vm.isEdit ? (
              <Button
                label={t('babyForm.delete')}
                icon="delete"
                variant="ghost"
                tone="danger"
                fullWidth
                onPress={vm.deleteBaby}
                loading={vm.deleting}
              />
            ) : null}
          </>
        }>
        {vm.atLimit ? <Notice text={t('babyForm.limit', { max: vm.maxBabies })} tone="info" /> : null}
        <BabyFormFields vm={vm} />
        {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
      </ScreenContainer>
    </>
  );
}

/** Name, birth date, sex and color fields; shared by the baby form and onboarding. */
export function BabyFormFields({ vm }: { vm: BabyFormVm }) {
  const i18n = useI18n();
  const { t } = i18n;
  return (
    <>
      <TextField
        label={t('babyForm.name')}
        value={vm.fields.name}
        onChangeText={vm.setName}
        maxLength={BABY_NAME_MAX}
        placeholder={t('babyForm.namePlaceholder')}
        error={vm.nameError}
        autoFocus={!vm.isEdit}
      />
      <DateField
        label={t('babyForm.birthDate')}
        value={vm.fields.birthDate}
        onChange={vm.setBirthDate}
        min={vm.earliest}
        max={vm.today}
        formatValue={(d) => formatDate(d, i18n, 'long')}
        previousLabel={t('common.previousDay')}
        nextLabel={t('common.nextDay')}
        invalidLabel={t('common.invalidDate')}
      />
      <Stack gap="sm">
        <Text variant="label" color="textSecondary">
          {t('babyForm.sex')}
        </Text>
        <ChipGroup>
          {SEXES.map((s) => (
            <Chip key={s} label={t(`babyForm.sexes.${s}`)} selected={vm.fields.sex === s} onPress={() => vm.setSex(s)} />
          ))}
        </ChipGroup>
      </Stack>
      <Stack gap="sm">
        <Text variant="label" color="textSecondary">
          {t('babyForm.color')}
        </Text>
        <ChipGroup>
          {vm.colors.map((c) => (
            <Chip
              key={c}
              label={t(`babyForm.colors.${c}`)}
              tone={babyTone(c)}
              selected={vm.fields.color === c}
              onPress={() => vm.setColor(c)}
            />
          ))}
        </ChipGroup>
      </Stack>
    </>
  );
}
