import { useI18n } from '@/core/i18n';
import { Card, Divider, EmptyState, PeriodNavigator, ScreenContainer, Stack, Text } from '@/design-system';
import { formatDurationShort, formatError, formatRelativeDay } from '@/shared/format';

import { EventRow } from './components/EventRow';
import { useTimelineViewModel } from './use-timeline-view-model';

export function TimelineScreen() {
  const i18n = useI18n();
  const { t } = i18n;
  const vm = useTimelineViewModel();
  return (
    <ScreenContainer title={t('timeline.title')}>
      <PeriodNavigator
        label={formatRelativeDay(vm.date, vm.today, vm.yesterday, i18n)}
        caption={
          vm.summary
            ? t('timeline.summaryLine', {
                feeds: vm.summary.feeding.total,
                diapers: vm.summary.diaper.total,
                sleep: formatDurationShort(vm.summary.sleep.totalMs, i18n),
              })
            : undefined
        }
        onPrevious={vm.previous}
        onNext={vm.next}
        canGoNext={vm.canGoNext}
        previousLabel={t('common.previousDay')}
        nextLabel={t('common.nextDay')}
      />
      {vm.error ? <Text color="danger">{formatError(vm.error, i18n)}</Text> : null}
      {!vm.loading && vm.events.length === 0 ? (
        <EmptyState icon="timeline" title={t('timeline.empty')} body={t('timeline.emptyBody')} tone="neutral" />
      ) : (
        <Card padding="md" gap="none">
          {vm.events.map((e, i) => (
            <Stack key={e.id}>
              {i > 0 ? <Divider /> : null}
              <EventRow event={e} onDelete={vm.deleteEvent} />
            </Stack>
          ))}
        </Card>
      )}
    </ScreenContainer>
  );
}
