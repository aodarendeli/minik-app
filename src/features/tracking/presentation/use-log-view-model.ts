import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import type { Result } from '@/core/result';
import { fromResult } from '@/core/query';
import { MINUTE_MS, type Instant } from '@/core/time';
import { useActiveBaby } from '@/features/babies';
import { useSnackbar } from '@/design-system';

import type { CareEvent } from '../domain';
import type { MinutesAgo } from './components/TimeAgoPicker';
import { TrackingDeps } from './deps';
import { useInvalidateCare } from './use-invalidate';

/**
 * Shared state for quick-log screens: "when" chips, note, save -> invalidate -> snackbar -> back.
 * `run` receives the active baby id and chosen instant.
 */
export function useLogViewModel<TArgs>(
  run: (input: { babyId: string; at: Instant; note: string; args: TArgs }) => Promise<Result<CareEvent>>,
  successMessage: string,
) {
  const { clock } = TrackingDeps.useDeps();
  const { baby } = useActiveBaby();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateCare();
  const [minutesAgo, setMinutesAgo] = useState<MinutesAgo>(0);
  const [note, setNote] = useState('');

  const mutation = useMutation({
    mutationFn: (args: TArgs) =>
      fromResult(run({ babyId: baby?.id ?? '', at: clock.now() - minutesAgo * MINUTE_MS, note, args })),
    onSuccess: async () => {
      await invalidate();
      snackbar.show({ message: successMessage });
      router.back();
    },
  });

  return {
    minutesAgo,
    setMinutesAgo,
    note,
    setNote,
    save: (args: TArgs) => mutation.mutate(args),
    saving: mutation.isPending,
    error: mutation.error,
  };
}

export function useTrackingUseCases() {
  return TrackingDeps.useDeps().useCases;
}
