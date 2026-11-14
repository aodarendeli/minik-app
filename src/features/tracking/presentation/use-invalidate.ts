import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

/** Care data changed: refresh tracking views and any report preview. */
export function useInvalidateCare() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reports }),
    ]);
}
