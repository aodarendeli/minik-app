import { useQuery } from '@tanstack/react-query';
import { createContext, use, useState, type ReactNode } from 'react';

import { fromResult, queryKeys } from '@/core/query';

import type { Baby } from '../domain';
import { BabiesDeps } from './deps';

type ActiveBabyState = {
  babies: Baby[];
  baby: Baby | undefined;
  isLoading: boolean;
  select: (id: string) => void;
};

const ActiveBabyContext = createContext<ActiveBabyState | null>(null);

export function useBabiesQuery() {
  const { useCases } = BabiesDeps.useDeps();
  return useQuery({ queryKey: queryKeys.babies, queryFn: () => fromResult(useCases.listBabies()) });
}

/** Holds which baby the app is showing. Falls back to the first baby when the selection disappears. */
export function ActiveBabyProvider({ children }: { children: ReactNode }) {
  const query = useBabiesQuery();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const babies = query.data ?? [];
  const baby = babies.find((b) => b.id === selectedId) ?? babies[0];
  return (
    <ActiveBabyContext value={{ babies, baby, isLoading: query.isLoading, select: setSelectedId }}>
      {children}
    </ActiveBabyContext>
  );
}

export function useActiveBaby(): ActiveBabyState {
  const value = use(ActiveBabyContext);
  if (!value) throw new Error('ActiveBabyProvider missing');
  return value;
}
