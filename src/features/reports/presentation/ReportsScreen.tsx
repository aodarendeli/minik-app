import { useI18n } from '@/core/i18n';
import {
  BarChart,
  Button,
  Card,
  Chip,
  ChipGroup,
  Notice,
  PeriodNavigator,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
  Stack,
  StatGrid,
  StatTile,
  Text,
} from '@/design-system';
import { formatDate, formatDateRange, formatDurationShort, formatError, formatHours, formatNumber } from '@/shared/format';

import type { ReportPeriod } from '../domain';
import { useReportsViewModel } from './use-reports-view-model';

export function ReportsScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useReportsViewModel();
  const m = vm.model;
  const weekly = vm.period === 'week';
  const avg = (v: string) => (weekly ? t('reports.avgCaption', { value: v }) : undefined);

  return (
    <ScreenContainer title={t('reports.title')} subtitle={t('reports.subtitle')}>
      <SegmentedControl<ReportPeriod>
        accessibilityLabel={t('reports.period')}
        value={vm.period}
        onChange={vm.setPeriod}
        options={[
          { value: 'day', label: t('reports.daily') },
          { value: 'week', label: t('reports.weekly') },
        ]}
      />
      <PeriodNavigator
        label={m ? formatDateRange(m.fromDate, m.toDate, i18n) : '…'}
        onPrevious={vm.previous}
        onNext={vm.next}
        canGoNext={vm.canGoNext}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
      />

      <Stack gap="sm">
        <Text variant="label" color="textSecondary">
          {t('reports.sections')}
        </Text>
        <ChipGroup>
          {vm.allSections.map((s) => (
            <Chip key={s} label={t(`reports.section.${s}`)} selected={vm.sections.includes(s)} onPress={() => vm.toggleSection(s)} />
          ))}
        </ChipGroup>
      </Stack>

      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}

      {m ? (
        <Stack gap="md">
          <SectionHeader title={t('reports.preview')} />
          <StatGrid>
            <StatTile icon="breast" tone="feeding" label={t('care.feeding')} value={String(m.totals.feeding.total)} caption={avg(formatNumber(m.averages.feeds, i18n))} />
            <StatTile icon="diaper" tone="diaper" label={t('care.diaper')} value={String(m.totals.diaper.total)} caption={avg(formatNumber(m.averages.diapers, i18n))} />
            <StatTile
              icon="sleep"
              tone="sleep"
              label={t('care.sleep')}
              value={formatDurationShort(m.totals.sleep.totalMs, i18n)}
              caption={avg(formatDurationShort(m.averages.sleepMs, i18n))}
            />
            <StatTile icon="lab" tone="health" label={t('reports.section.labs')} value={String(m.labs.length)} caption={t('reports.labsInPeriod', { count: m.labs.length })} />
          </StatGrid>
          {weekly ? (
            <>
              <Card>
                <Text variant="label" color="textSecondary">
                  {t('reports.feedsPerDay')}
                </Text>
                <BarChart
                  tone="feeding"
                  accessibilityLabel={t('reports.feedsPerDay')}
                  average={{ value: m.averages.feeds, label: t('reports.avgShort', { value: formatNumber(m.averages.feeds, i18n) }) }}
                  data={m.days.map((d) => ({
                    key: d.date,
                    label: formatDate(d.date, i18n).split(' ')[0] ?? d.date,
                    value: d.summary.feeding.total,
                    valueLabel: String(d.summary.feeding.total),
                  }))}
                />
              </Card>
              <Card>
                <Text variant="label" color="textSecondary">
                  {t('reports.sleepPerDay')}
                </Text>
                <BarChart
                  tone="sleep"
                  accessibilityLabel={t('reports.sleepPerDay')}
                  average={{ value: m.averages.sleepMs, label: t('reports.avgShort', { value: formatHours(m.averages.sleepMs, i18n) }) }}
                  data={m.days.map((d) => ({
                    key: d.date,
                    label: formatDate(d.date, i18n).split(' ')[0] ?? d.date,
                    value: d.summary.sleep.totalMs,
                    valueLabel: formatHours(d.summary.sleep.totalMs, i18n),
                  }))}
                />
              </Card>
            </>
          ) : null}
        </Stack>
      ) : null}

      <Button
        label={vm.exporting ? t('reports.generating') : t('reports.generate')}
        icon="pdf"
        size="lg"
        fullWidth
        onPress={vm.exportPdf}
        loading={vm.exporting}
        disabled={!m || vm.sections.length === 0}
      />
      <Notice text={t('common.disclaimer')} />
    </ScreenContainer>
  );
}
