import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/core/query';

import { DEFAULT_SETTINGS, type Settings } from '../domain';
import { SettingsDeps } from './deps';

function useSettingsQuery() {
  const useCases = SettingsDeps.useDeps();
  return useQuery({ queryKey: queryKeys.settings, queryFn: () => useCases.getSettings(), staleTime: Infinity });
}

export function useSettings(): Settings {
  return useSettingsQuery().data ?? DEFAULT_SETTINGS;
}

/** False until the stored settings were read (keeps the splash, so onboarding never flashes for returning users). */
export function useSettingsReady(): boolean {
  return useSettingsQuery().data !== undefined;
}

export function useUpdateSettings() {
  const useCases = SettingsDeps.useDeps();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (patch: Partial<Settings>) => useCases.updateSettings(patch),
    onSuccess: (next) => queryClient.setQueryData(queryKeys.settings, next),
  });
  return mutation.mutate;
}
