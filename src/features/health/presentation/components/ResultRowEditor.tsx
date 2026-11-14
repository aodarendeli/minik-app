import { useI18n } from '@/core/i18n';
import { Card, IconButton, Inline, Stack, TextField } from '@/design-system';

import type { ResultRow } from '../use-lab-form-view-model';

export function ResultRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: ResultRow;
  onChange: (patch: Partial<ResultRow>) => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  return (
    <Card padding="md" gap="sm">
      <Inline gap="xs" align="end">
        <Stack flex>
          <TextField
            label={t('labForm.analyte')}
            placeholder={t('labForm.analytePlaceholder')}
            value={row.analyte}
            onChangeText={(analyte) => onChange({ analyte })}
          />
        </Stack>
        <IconButton icon="close" label={t('labForm.removeResult')} onPress={onRemove} />
      </Inline>
      <Inline gap="sm" align="start">
        <Stack flex>
          <TextField label={t('labForm.value')} keyboard="decimal" value={row.value} onChangeText={(value) => onChange({ value })} />
        </Stack>
        <Stack flex>
          <TextField label={t('labForm.unit')} value={row.unit} onChangeText={(unit) => onChange({ unit })} />
        </Stack>
      </Inline>
      <Inline gap="sm" align="start">
        <Stack flex>
          <TextField label={t('labForm.refLow')} keyboard="decimal" value={row.refLow} onChangeText={(refLow) => onChange({ refLow })} />
        </Stack>
        <Stack flex>
          <TextField label={t('labForm.refHigh')} keyboard="decimal" value={row.refHigh} onChangeText={(refHigh) => onChange({ refHigh })} />
        </Stack>
      </Inline>
    </Card>
  );
}
