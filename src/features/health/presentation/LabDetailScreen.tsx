import { Stack as RouterStack } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { Badge, Button, Card, Divider, Inline, Notice, ScreenContainer, Stack, Text } from '@/design-system';
import { formatDate, formatError } from '@/shared/format';

import { rangePosition } from '../domain';
import { formatRefRange, formatResultValue, positionTone } from './lab-format';
import { useLabDetailViewModel } from './use-lab-detail-view-model';

export function LabDetailScreen({ id }: { id: string }) {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useLabDetailViewModel(id);
  const test = vm.test;
  return (
    <>
      <RouterStack.Screen options={{ title: test?.title ?? t('health.detailTitle') }} />
      <ScreenContainer
        footer={
          test ? (
            <Inline gap="sm">
              <Stack flex>
                <Button label={t('common.edit')} icon="edit" variant="soft" tone="health" fullWidth onPress={vm.edit} />
              </Stack>
              <Stack flex>
                <Button label={t('common.delete')} icon="delete" variant="ghost" tone="danger" fullWidth onPress={vm.remove} />
              </Stack>
            </Inline>
          ) : undefined
        }>
        {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
        {test ? (
          <>
            <Card tone="health">
              <Text variant="title2" color="onHealthSoft">
                {test.title}
              </Text>
              <Text color="onHealthSoft">
                {[formatDate(test.takenOn, i18n, 'long'), t(`health.category.${test.category}`), test.labName].filter(Boolean).join(' · ')}
              </Text>
              {test.note ? <Text color="onHealthSoft">{test.note}</Text> : null}
            </Card>
            <Stack gap="sm">
              <Text variant="title2" accessibilityRole="header">
                {t('health.results')}
              </Text>
              {test.results.length === 0 ? (
                <Text color="textSecondary">{t('health.noResults')}</Text>
              ) : (
                <Card padding="md" gap="none">
                  {test.results.map((r, i) => {
                    const position = rangePosition(r);
                    const ref = formatRefRange(r, i18n);
                    return (
                      <Stack key={r.id} gap="xs" paddingY="sm">
                        {i > 0 ? <Divider /> : null}
                        <Inline gap="sm" justify="between">
                          <Text variant="bodyStrong">{r.analyte}</Text>
                          <Text variant="bodyStrong">{formatResultValue(r, i18n)}</Text>
                        </Inline>
                        <Inline gap="sm" justify="between" wrap>
                          <Text variant="caption" color="textSecondary">
                            {ref ? t('health.refRange', { range: ref }) : ''}
                          </Text>
                          <Badge label={t(`health.position.${position}`)} tone={positionTone[position]} />
                        </Inline>
                      </Stack>
                    );
                  })}
                </Card>
              )}
            </Stack>
            <Notice text={t('common.disclaimer')} />
          </>
        ) : null}
      </ScreenContainer>
    </>
  );
}
