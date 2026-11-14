import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import { useActiveBaby } from '@/features/babies';
import { confirmAsync, useSnackbar } from '@/design-system';
import { formatDurationShort } from '@/shared/format';

import {
  currentSide,
  elapsedMs,
  eventDurationMs,
  QUICK_DISCARD_MS,
  sideDurations,
  type SessionKind,
  type Side,
} from '../domain';
import { TrackingDeps } from './deps';
import { useInvalidateCare } from './use-invalidate';
import { useNow } from './use-now';

export function useSessionViewModel(kind: SessionKind) {
  const { useCases } = TrackingDeps.useDeps();
  const { baby } = useActiveBaby();
  const i18n = useI18n();
  const { t } = i18n;
  const snackbar = useSnackbar();
  const invalidate = useInvalidateCare();
  const babyId = baby?.id ?? '';

  const query = useQuery({
    queryKey: [...queryKeys.tracking, 'session', babyId, kind],
    queryFn: () => fromResult(useCases.getSession(babyId, kind)),
    enabled: baby !== undefined,
  });
  const session = query.data ?? null;
  const now = useNow(1000, session?.status === 'running');

  const act = useMutation({
    mutationFn: async (
      action:
        | { type: 'start' | 'switch' | 'correctSide'; side?: Side }
        | { type: 'backdate'; minutes: number }
        | { type: 'pause' | 'resume' | 'discard' },
    ) => {
      if (action.type === 'start') return fromResult(useCases.startSession({ babyId, kind, side: 'side' in action ? action.side : undefined }));
      if (action.type === 'switch') return fromResult(useCases.switchSide(babyId, action.side ?? 'left'));
      if (action.type === 'correctSide') return fromResult(useCases.correctStartSide(babyId, action.side ?? 'left'));
      if (action.type === 'backdate') return fromResult(useCases.setStartedMinutesAgo(babyId, kind, action.minutes));
      if (action.type === 'pause') return fromResult(useCases.pauseSession(babyId, kind));
      if (action.type === 'resume') return fromResult(useCases.resumeSession(babyId, kind));
      return fromResult(useCases.discardSession(babyId, kind));
    },
    onSuccess: invalidate,
  });

  const stop = useMutation({
    mutationFn: () => fromResult(useCases.stopSession(babyId, kind)),
    onSuccess: async (result) => {
      await invalidate();
      if (result.event) {
        const time = formatDurationShort(eventDurationMs(result.event), i18n);
        snackbar.show({ message: t(kind === 'sleep' ? 'timer.sleepSaved' : 'timer.feedingSaved', { time }) });
      } else if (result.tooShort) {
        snackbar.show({ message: t('timer.tooShort') });
      }
      router.back();
    },
  });

  const sides = session ? sideDurations(session.segments, now) : { leftMs: 0, rightMs: 0 };
  const elapsed = session ? elapsedMs(session, now) : 0;

  return {
    loading: query.isLoading,
    session,
    now,
    elapsed,
    /** Single segment and still early: offer "started on the other side?" instead of switching. */
    canCorrectSide: kind === 'breastFeeding' && session?.segments.length === 1 && elapsed < 2 * 60_000,
    sides,
    side: session ? currentSide(session) : undefined,
    running: session?.status === 'running',
    busy: act.isPending || stop.isPending,
    error: act.error ?? stop.error,
    start: (side?: Side) => act.mutate({ type: 'start', side }),
    switchTo: (side: Side) => act.mutate({ type: 'switch', side }),
    correctSide: (side: Side) => act.mutate({ type: 'correctSide', side }),
    startedMinutesAgo: (minutes: number) => act.mutate({ type: 'backdate', minutes }),
    togglePause: () => act.mutate({ type: session?.status === 'running' ? 'pause' : 'resume' }),
    finish: () => stop.mutate(),
    discard: async () => {
      // A timer opened by mistake goes away without a dialog.
      const quick = elapsed < QUICK_DISCARD_MS;
      const yes = quick || await confirmAsync({
        title: t('timer.discardTitle'),
        message: t('timer.discardBody'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        destructive: true,
      });
      if (yes) {
        act.mutate({ type: 'discard' }, { onSuccess: () => router.back() });
      }
    },
  };
}

export function useSuggestedSide(): Side {
  const { baby } = useActiveBaby();
  const { useCases } = TrackingDeps.useDeps();
  const query = useQuery({
    queryKey: [...queryKeys.tracking, 'next-side', baby?.id],
    queryFn: () => fromResult(useCases.getNextSide(baby?.id ?? '')),
    enabled: baby !== undefined,
  });
  return query.data ?? 'left';
}
