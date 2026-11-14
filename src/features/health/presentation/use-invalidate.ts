import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

export function useInvalidateHealth() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.health }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reports }),
    ]);
}
