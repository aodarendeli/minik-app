import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import { confirmAsync, useSnackbar } from '@/design-system';

import { HealthDeps } from './deps';
import { useInvalidateHealth } from './use-invalidate';

export function useLabDetailViewModel(id: string) {
  const { useCases } = HealthDeps.useDeps();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateHealth();
  const query = useQuery({
    queryKey: [...queryKeys.health, 'detail', id],
    queryFn: () => fromResult(useCases.getLabTest(id)),
  });
  const restore = useMutation({ mutationFn: () => fromResult(useCases.restoreLabTest(id)), onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: () => fromResult(useCases.deleteLabTest(id)),
    onSuccess: async () => {
      await invalidate();
      router.back();
      snackbar.show({ message: t('common.deleted'), action: { label: t('common.undo'), onPress: () => restore.mutate() } });
    },
  });
  return {
    loading: query.isLoading,
    error: query.error,
    test: query.data,
    edit: () => router.push({ pathname: '/labs/new', params: { id } }),
    remove: async () => {
      const yes = await confirmAsync({
        title: t('health.deleteTitle'),
        message: t('health.deleteBody'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        destructive: true,
      });
      if (yes) remove.mutate();
    },
  };
}
