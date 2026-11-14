import { useQuery } from '@tanstack/react-query';
import { Stack as RouterStack } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import {
  Button,
  Chip,
  ChipGroup,
  DateField,
  Notice,
  ScreenContainer,
  SectionHeader,
  Stack,
  Text,
  TextField,
} from '@/design-system';
import { formatDate, formatError } from '@/shared/format';

import { LAB_CATEGORIES, LAB_RESULTS_MAX, LAB_TITLE_MAX, type LabTest } from '../domain';
import { ResultRowEditor } from './components/ResultRowEditor';
import { HealthDeps } from './deps';
import { useLabFormViewModel } from './use-lab-form-view-model';

/** Loads the test when editing, then renders the form with initial values. */
export function LabFormScreen({ editId }: { editId?: string }) {
  const { useCases } = HealthDeps.useDeps();
  const query = useQuery({
    queryKey: [...queryKeys.health, 'detail', editId],
    queryFn: () => fromResult(useCases.getLabTest(editId ?? '')),
    enabled: editId !== undefined,
  });
  if (editId && !query.data) return <ScreenContainer>{null}</ScreenContainer>;
  return <LabForm key={query.data?.id ?? 'new'} existing={query.data} />;
}

function LabForm({ existing }: { existing?: LabTest }) {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useLabFormViewModel(existing);
  return (
    <>
      <RouterStack.Screen options={{ title: t(vm.isEdit ? 'labForm.editTitle' : 'labForm.newTitle') }} />
      <ScreenContainer footer={<Button label={t('common.save')} onPress={vm.save} loading={vm.saving} tone="health" fullWidth size="lg" />}>
        {!vm.isEdit ? (
          <Stack gap="sm">
            <Text variant="label" color="textSecondary">
              {t('labForm.templates')}
            </Text>
            <ChipGroup>
              {vm.presets.map((p) => (
                <Chip
                  key={p.key}
                  label={p.title}
                  icon="lab"
                  tone="health"
                  selected={vm.presetKey === p.key}
                  onPress={() => void vm.applyPreset(p)}
                />
              ))}
            </ChipGroup>
            <Text variant="caption" color="textTertiary">
              {t('labForm.templatesHelper')}
            </Text>
          </Stack>
        ) : null}
        <Stack gap="sm">
          <Text variant="label" color="textSecondary">
            {t('labForm.category')}
          </Text>
          <ChipGroup>
            {LAB_CATEGORIES.map((c) => (
              <Chip key={c} label={t(`health.category.${c}`)} tone="health" selected={vm.fields.category === c} onPress={() => vm.setCategory(c)} />
            ))}
          </ChipGroup>
        </Stack>
        <TextField
          label={t('labForm.title')}
          placeholder={t('labForm.titlePlaceholder')}
          value={vm.fields.title}
          onChangeText={vm.setTitle}
          maxLength={LAB_TITLE_MAX}
          error={vm.titleError}
        />
        <DateField
          label={t('labForm.date')}
          value={vm.fields.takenOn}
          onChange={vm.setTakenOn}
          max={vm.today}
          formatValue={(d) => formatDate(d, i18n, 'long')}
          previousLabel={t('common.previousDay')}
          nextLabel={t('common.nextDay')}
          invalidLabel={t('common.invalidDate')}
        />
        <TextField
          label={`${t('labForm.labName')} (${t('common.optional')})`}
          placeholder={t('labForm.labPlaceholder')}
          value={vm.fields.labName}
          onChangeText={vm.setLabName}
        />
        <Stack gap="md">
          <SectionHeader
            title={t('labForm.results')}
            action={vm.canAddRow ? { label: t('labForm.addResult'), onPress: vm.addRow } : undefined}
          />
          {vm.rows.map((row) => (
            <ResultRowEditor
              key={row.key}
              row={row}
              onChange={(patch) => vm.updateRow(row.key, patch)}
              onRemove={() => vm.removeRow(row.key)}
            />
          ))}
          {vm.valuesError ? <Text color="danger">{vm.valuesError}</Text> : null}
          {vm.canAddRow ? (
            <Button label={t('labForm.addResult')} icon="add" variant="soft" tone="health" onPress={vm.addRow} />
          ) : (
            <Notice text={t('labForm.rowLimit', { max: LAB_RESULTS_MAX })} tone="info" />
          )}
        </Stack>
        <TextField
          label={`${t('common.note')} (${t('common.optional')})`}
          value={vm.fields.note}
          onChangeText={vm.setNote}
          multiline
        />
        {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
      </ScreenContainer>
    </>
  );
}
