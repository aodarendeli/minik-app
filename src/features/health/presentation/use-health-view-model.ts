import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fromResult, queryKeys } from '@/core/query';
import { useActiveBaby } from '@/features/babies';

import { analyteHistory, type LabTest } from '../domain';
import { HealthDeps } from './deps';

export function useLabTestsQuery(babyId: string | undefined) {
  const { useCases } = HealthDeps.useDeps();
  return useQuery({
    queryKey: [...queryKeys.health, 'list', babyId],
    queryFn: () => fromResult(useCases.listLabTests(babyId ?? '')),
    enabled: babyId !== undefined,
  });
}

/** Analytes measured in at least two tests, most frequent first. */
function trackedAnalytes(tests: readonly LabTest[]): string[] {
  const counts = new Map<string, { name: string; n: number }>();
  for (const test of tests) {
    for (const r of test.results) {
      const key = r.analyte.toLocaleLowerCase();
      const entry = counts.get(key) ?? { name: r.analyte, n: 0 };
      counts.set(key, { ...entry, n: entry.n + 1 });
    }
  }
  return [...counts.values()].filter((c) => c.n >= 2).sort((a, b) => b.n - a.n).map((c) => c.name);
}

export function useHealthViewModel() {
  const { baby } = useActiveBaby();
  const query = useLabTestsQuery(baby?.id);
  const tests = query.data ?? [];
  const analytes = trackedAnalytes(tests);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const current = selected && analytes.includes(selected) ? selected : analytes[0];
  return {
    loading: query.isLoading,
    error: query.error,
    tests,
    analytes,
    selectedAnalyte: current,
    selectAnalyte: setSelected,
    history: current ? analyteHistory(tests, current) : [],
  };
}
