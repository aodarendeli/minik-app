import { Stack as RouterStack } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { addLocalDays, fromLocalDate, toLocalDate } from '@/core/time';
import { Button, DateField, Notice, ScreenContainer, SegmentedControl, Text, TextField } from '@/design-system';
import { formatDate, formatError } from '@/shared/format';

import { GROWTH_METRICS, MED_KINDS, RECORD_DOSE_MAX, RECORD_NAME_MAX, type GrowthEntry, type MedEntry, type MedKind } from '../domain';
import { useGrowthFormViewModel, useGrowthQuery, useMedFormViewModel, useMedsQuery } from './use-records';

function useDateFieldLabels() {
  const { t } = useI18n();
  return { previousLabel: t('common.previousDay'), nextLabel: t('common.nextDay'), invalidLabel: t('common.invalidDate') };
}

/** `editId` loads an existing measurement; the form mounts once it is available. */
export function GrowthFormScreen({ editId }: { editId?: string }) {
  const query = useGrowthQuery();
  const existing = query.data?.find((e) => e.id === editId);
  if (editId && !existing) return <ScreenContainer>{null}</ScreenContainer>;
  return <GrowthForm key={existing?.id ?? 'new'} existing={existing} />;
}

function GrowthForm({ existing }: { existing?: GrowthEntry }) {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useGrowthFormViewModel(existing);
  const dates = useDateFieldLabels();
  return (
    <>
      <RouterStack.Screen options={{ title: t(vm.isEdit ? 'records.growthEditTitle' : 'records.growthNewTitle') }} />
      <ScreenContainer
        footer={
          <>
            <Button label={t('common.save')} onPress={vm.save} loading={vm.saving} tone="sleep" fullWidth size="lg" />
            {existing ? (
              <Button label={t('records.delete')} icon="delete" variant="ghost" tone="danger" fullWidth onPress={() => void vm.remove(existing.id)} />
            ) : null}
          </>
        }>
        <DateField
          label={t('records.measuredOn')}
          value={vm.measuredOn}
          onChange={vm.setMeasuredOn}
          max={vm.today}
          formatValue={(d) => formatDate(d, i18n, 'long')}
          {...dates}
        />
        {GROWTH_METRICS.map((m) => (
          <TextField
            key={m}
            label={t(`records.metrics.${m}`)}
            suffix={t(`records.units.${m}`)}
            keyboard="decimal"
            value={vm.values[m]}
            onChangeText={(v) => vm.setValue(m, v)}
            error={vm.errorField === m ? t('records.growthErrorRange') : undefined}
          />
        ))}
        {vm.errorField === 'empty' ? <Text color="danger">{t('records.growthErrorEmpty')}</Text> : null}
        <TextField label={`${t('common.note')} (${t('common.optional')})`} value={vm.note} onChangeText={vm.setNote} multiline />
        <Text variant="caption" color="textTertiary">
          {t('records.growthHint')}
        </Text>
      </ScreenContainer>
    </>
  );
}

export function MedFormScreen({ editId, kind }: { editId?: string; kind?: MedKind }) {
  const query = useMedsQuery();
  const existing = query.data?.find((e) => e.id === editId);
  if (editId && !existing) return <ScreenContainer>{null}</ScreenContainer>;
  return <MedForm key={existing?.id ?? 'new'} existing={existing} kind={kind} />;
}

function MedForm({ existing, kind }: { existing?: MedEntry; kind?: MedKind }) {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useMedFormViewModel(existing, kind);
  const dates = useDateFieldLabels();
  const f = vm.fields;
  const title = vm.isEdit ? 'records.medEditTitle' : f.kind === 'vaccine' ? 'records.medNewVaccine' : 'records.medNewMed';
  const tone = f.kind === 'vaccine' ? 'info' : 'health';
  const nextDefault = toLocalDate(addLocalDays(fromLocalDate(f.givenOn), 30));
  return (
    <>
      <RouterStack.Screen options={{ title: t(title) }} />
      <ScreenContainer
        footer={
          <>
            <Button label={t('common.save')} onPress={vm.save} loading={vm.saving} tone={tone} fullWidth size="lg" />
            {existing ? (
              <Button label={t('records.delete')} icon="delete" variant="ghost" tone="danger" fullWidth onPress={() => void vm.remove(existing.id)} />
            ) : null}
          </>
        }>
        <SegmentedControl
          accessibilityLabel={t(title)}
          value={f.kind}
          onChange={vm.setKind}
          options={MED_KINDS.map((k) => ({ value: k, label: t(`records.kinds.${k}`) }))}
        />
        <TextField
          label={t('records.name')}
          placeholder={t(`records.namePlaceholders.${f.kind}`)}
          value={f.name}
          onChangeText={vm.setName}
          maxLength={RECORD_NAME_MAX}
          error={vm.nameError}
          autoFocus={!vm.isEdit}
        />
        <DateField
          label={t('records.givenOn')}
          value={f.givenOn}
          onChange={vm.setGivenOn}
          max={vm.today}
          formatValue={(d) => formatDate(d, i18n, 'long')}
          {...dates}
        />
        <TextField
          label={`${t('records.dose')} (${t('common.optional')})`}
          placeholder={t('records.dosePlaceholder')}
          value={f.dose}
          onChangeText={vm.setDose}
          maxLength={RECORD_DOSE_MAX}
        />
        {f.nextOn !== undefined ? (
          <>
            <DateField
              label={t('records.nextOn')}
              value={f.nextOn}
              onChange={vm.setNextOn}
              formatValue={(d) => formatDate(d, i18n, 'long')}
              {...dates}
            />
            {vm.nextOnError ? <Text color="danger">{vm.nextOnError}</Text> : null}
            <Notice text={t('records.reminderHint')} tone="info" />
            <Button label={t('records.removeNext')} variant="ghost" tone="neutral" onPress={() => vm.setNextOn(undefined)} />
          </>
        ) : (
          <Button label={t('records.addNext')} icon="bell" variant="soft" tone={tone} onPress={() => vm.setNextOn(nextDefault)} />
        )}
        <TextField label={`${t('common.note')} (${t('common.optional')})`} value={f.note} onChangeText={vm.setNote} multiline />
        {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
        <Notice text={t('records.notAdvice')} />
      </ScreenContainer>
    </>
  );
}
