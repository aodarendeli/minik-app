import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { fromResult, queryKeys } from '@/core/query';
import { dayRange } from '@/core/time';
import { useActiveBaby } from '@/features/babies';

import { useInvalidateCare } from './use-invalidate';
import { TrackingDeps } from './deps';
import { useNow } from './use-now';

export function useDayOverviewQuery(babyId: string | undefined, at: number) {
  const { useCases } = TrackingDeps.useDeps();
  const range = dayRange(at);
  return useQuery({
    queryKey: [...queryKeys.tracking, 'day', babyId, range.from],
    queryFn: () => fromResult(useCases.getDayOverview(babyId ?? '', range)),
    enabled: babyId !== undefined,
  });
}

export function useTodayViewModel() {
  const { useCases } = TrackingDeps.useDeps();
  const { baby, babies, select, isLoading: babiesLoading } = useActiveBaby();
  const now = useNow(30_000);
  const overview = useDayOverviewQuery(baby?.id, now);
  const invalidate = useInvalidateCare();
  const hasSession = (overview.data?.sessions.length ?? 0) > 0;
  const tick = useNow(1000, hasSession);

  const start = useMutation({
    mutationFn: (kind: 'breastFeeding' | 'sleep') =>
      fromResult(
        useCases.startSession({
          babyId: baby?.id ?? '',
          kind,
          side: kind === 'breastFeeding' ? overview.data?.nextSide : undefined,
        }),
      ),
    onSuccess: async (session) => {
      await invalidate();
      router.push(session.kind === 'sleep' ? '/log/sleep' : '/log/breast');
    },
  });

  return {
    baby,
    babies,
    selectBaby: select,
    loading: babiesLoading || overview.isLoading,
    error: overview.error,
    overview: overview.data,
    now: hasSession ? tick : now,
    startBreast: () => start.mutate('breastFeeding'),
    startSleep: () => start.mutate('sleep'),
  };
}
