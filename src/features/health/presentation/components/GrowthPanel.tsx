import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import {
  BarChart,
  Button,
  Card,
  Chip,
  ChipGroup,
  Divider,
  EmptyState,
  ListItem,
  SectionHeader,
  Stack,
  StatGrid,
  StatTile,
  Text,
  type Tone,
} from '@/design-system';
import { formatDate, formatNumber } from '@/shared/format';

import { GROWTH_METRICS, latestGrowth, type GrowthEntry, type GrowthMetric } from '../../domain';
import { useGrowthQuery } from '../use-records';

const CHART_POINTS = 8;
const TONE: Record<GrowthMetric, Tone> = { weightKg: 'feeding', heightCm: 'sleep', headCm: 'diaper' };

export function GrowthPanel() {
  const i18n = useI18n();
  const { t } = i18n;
  const query = useGrowthQuery();
  const entries = query.data ?? [];
  const latest = latestGrowth(entries);
  const [metric, setMetric] = useState<GrowthMetric>('weightKg');
  const fmt = (m: GrowthMetric, v: number) => `${formatNumber(v, i18n, 2)} ${t(`records.units.${m}`)}`;
  const add = () => router.push('/growth/new');
  const points = entries
    .filter((e) => e[metric] !== undefined)
    .slice(0, CHART_POINTS)
    .reverse();

  if (!query.isLoading && entries.length === 0) {
    return (
      <EmptyState
        icon="ruler"
        tone="sleep"
        title={t('records.growthEmptyTitle')}
        body={t('records.growthEmptyBody')}
        action={{ label: t('records.addGrowth'), onPress: add }}
      />
    );
  }

  const describe = (e: GrowthEntry) =>
    GROWTH_METRICS.flatMap((m) => {
      const v = e[m];
      return v === undefined ? [] : [`${t(`records.metrics.${m}`)} ${fmt(m, v)}`];
    }).join(' · ');

  return (
    <>
      <Stack gap="md">
        <SectionHeader title={t('records.latest')} action={{ label: t('records.addGrowth'), onPress: add }} />
        <StatGrid>
          {GROWTH_METRICS.map((m) => {
            const l = latest[m];
            return (
              <StatTile
                key={m}
                compact
                icon="ruler"
                tone={TONE[m]}
                label={t(`records.metrics.${m}`)}
                value={l ? formatNumber(l.value, i18n, 2) : '—'}
                caption={l ? `${t(`records.units.${m}`)} · ${formatDate(l.on, i18n)}` : undefined}
              />
            );
          })}
        </StatGrid>
      </Stack>

      <Card>
        <ChipGroup>
          {GROWTH_METRICS.map((m) => (
            <Chip key={m} label={t(`records.metrics.${m}`)} tone={TONE[m]} selected={m === metric} onPress={() => setMetric(m)} />
          ))}
        </ChipGroup>
        {points.length > 0 ? (
          <BarChart
            tone={TONE[metric]}
            accessibilityLabel={t('records.historyOf', { name: t(`records.metrics.${metric}`) })}
            data={points.map((e) => ({
              key: e.id,
              label: formatDate(e.measuredOn, i18n),
              value: e[metric] ?? 0,
              valueLabel: formatNumber(e[metric] ?? 0, i18n, 2),
            }))}
          />
        ) : (
          <Text color="textSecondary">{t('records.growthErrorEmpty')}</Text>
        )}
      </Card>

      <Card padding="md" gap="none">
        {entries.map((e, i) => (
          <Stack key={e.id}>
            {i > 0 ? <Divider /> : null}
            <ListItem
              icon="ruler"
              tone="sleep"
              title={formatDate(e.measuredOn, i18n, 'long')}
              subtitle={[describe(e), e.note].filter(Boolean).join(' · ')}
              onPress={() => router.push({ pathname: '/growth/new', params: { id: e.id } })}
              showChevron
            />
          </Stack>
        ))}
      </Card>
      <Button label={t('records.addGrowth')} icon="add" tone="sleep" variant="soft" onPress={add} />
    </>
  );
}
