import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { fromResult } from '@/core/query';
import { addLocalDays, startOfLocalDay, toLocalDate } from '@/core/time';
import { useActiveBaby } from '@/features/babies';
import { useSnackbar } from '@/design-system';

import type { CareEvent } from '../domain';
import { TrackingDeps } from './deps';
import { useDayOverviewQuery } from './use-today-view-model';
import { useInvalidateCare } from './use-invalidate';

export function useTimelineViewModel() {
  const { useCases, clock } = TrackingDeps.useDeps();
  const { baby } = useActiveBaby();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateCare();
  const todayStart = startOfLocalDay(clock.now());
  const [dayStart, setDayStart] = useState(todayStart);
  const query = useDayOverviewQuery(baby?.id, dayStart);

  const restore = useMutation({ mutationFn: (id: string) => fromResult(useCases.restoreEvent(id)), onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: (id: string) => fromResult(useCases.deleteEvent(id)),
    onSuccess: async (event) => {
      await invalidate();
      snackbar.show({
        message: t('common.deleted'),
        action: { label: t('common.undo'), onPress: () => restore.mutate(event.id) },
      });
    },
  });

  return {
    date: toLocalDate(dayStart),
    today: toLocalDate(todayStart),
    yesterday: toLocalDate(addLocalDays(todayStart, -1)),
    canGoNext: dayStart < todayStart,
    previous: () => setDayStart((d) => addLocalDays(d, -1)),
    next: () => setDayStart((d) => Math.min(todayStart, addLocalDays(d, 1))),
    loading: query.isLoading,
    error: query.error,
    events: query.data?.events ?? [],
    summary: query.data?.summary,
    deleteEvent: (event: CareEvent) => remove.mutate(event.id),
  };
}
