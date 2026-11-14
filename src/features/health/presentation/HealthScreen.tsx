import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import {
  Badge,
  BarChart,
  Button,
  Card,
  Chip,
  ChipGroup,
  Divider,
  EmptyState,
  Notice,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
  Stack,
  Text,
} from '@/design-system';
import { formatDate, formatError, formatNumber } from '@/shared/format';

import { countOutsideRange } from '../domain';
import { categoryIcon, positionTone } from './lab-format';
import { useHealthViewModel } from './use-health-view-model';
import { GrowthPanel } from './components/GrowthPanel';
import { LabTestRow } from './components/LabTestRow';
import { MedsPanel } from './components/MedsPanel';

type Section = 'labs' | 'growth' | 'meds';
const SECTIONS: readonly Section[] = ['labs', 'growth', 'meds'];

export function HealthScreen() {
  const { t } = useI18n();
  const [section, setSection] = useState<Section>('labs');
  return (
    <ScreenContainer title={t('health.title')}>
      <SegmentedControl
        accessibilityLabel={t('health.title')}
        value={section}
        onChange={setSection}
        options={SECTIONS.map((s) => ({ value: s, label: t(`records.segment.${s}`) }))}
      />
      {section === 'labs' ? <LabsPanel /> : section === 'growth' ? <GrowthPanel /> : <MedsPanel />}
    </ScreenContainer>
  );
}

function LabsPanel() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useHealthViewModel();
  const addTest = () => router.push('/labs/new');

  return (
    <>
      <Notice text={t('common.disclaimer')} />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}

      {vm.analytes.length > 0 && vm.selectedAnalyte ? (
        <Stack gap="md">
          <SectionHeader title={t('health.tracking')} />
          <Text variant="caption" color="textSecondary">
            {t('health.trackingBody')}
          </Text>
          <ChipGroup>
            {vm.analytes.map((a) => (
              <Chip key={a} label={a} tone="health" selected={a === vm.selectedAnalyte} onPress={() => vm.selectAnalyte(a)} />
            ))}
          </ChipGroup>
          <Card>
            <Text variant="label" color="textSecondary">
              {t('health.historyOf', { name: vm.selectedAnalyte })}
            </Text>
            <BarChart
              tone="health"
              accessibilityLabel={t('health.historyOf', { name: vm.selectedAnalyte })}
              data={vm.history.map((p, i) => ({
                key: `${p.testId}-${i}`,
                label: formatDate(p.takenOn, i18n),
                value: p.value,
                valueLabel: formatNumber(p.value, i18n, 2),
              }))}
            />
            <Stack gap="xs">
              {vm.history.map((p, i) => (
                <Badge key={`${p.testId}-b${i}`} label={`${formatDate(p.takenOn, i18n)} · ${t(`health.position.${p.position}`)}`} tone={positionTone[p.position]} />
              ))}
            </Stack>
          </Card>
        </Stack>
      ) : null}

      <Stack gap="md">
        <SectionHeader title={t('health.tests')} action={{ label: t('health.addTest'), onPress: addTest }} />
        {!vm.loading && vm.tests.length === 0 ? (
          <EmptyState
            icon="lab"
            tone="health"
            title={t('health.emptyTitle')}
            body={t('health.emptyBody')}
            action={{ label: t('health.addTest'), onPress: addTest }}
          />
        ) : (
          <Card padding="md" gap="none">
            {vm.tests.map((test, i) => (
              <Stack key={test.id}>
                {i > 0 ? <Divider /> : null}
                <LabTestRow
                  test={test}
                  icon={categoryIcon[test.category]}
                  outside={countOutsideRange(test)}
                  onPress={() => router.push({ pathname: '/labs/[id]', params: { id: test.id } })}
                />
              </Stack>
            ))}
          </Card>
        )}
      </Stack>
      {vm.tests.length > 0 ? <Button label={t('health.addTest')} icon="add" tone="health" variant="soft" onPress={addTest} /> : null}
    </>
  );
}
