import { QueryClient } from '@tanstack/react-query';

import { unwrap, type Result } from './result';

/** Top-level key prefixes; invalidate a prefix after mutations in that area. */
export const queryKeys = {
  babies: ['babies'] as const,
  tracking: ['tracking'] as const,
  health: ['health'] as const,
  reports: ['reports'] as const,
  settings: ['settings'] as const,
};

export function createQueryClient(overrides: { gcTime?: number; retry?: number } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false, ...overrides },
      mutations: { retry: 0, ...(overrides.gcTime !== undefined ? { gcTime: overrides.gcTime } : {}) },
    },
  });
}

/** Use-cases return Result; queries/mutations need throw-on-error. */
export async function fromResult<T>(promise: Promise<Result<T>>): Promise<T> {
  return unwrap(await promise);
}
