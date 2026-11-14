import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useI18n } from '@/core/i18n';
import { queryKeys } from '@/core/query';
import { confirmAsync, useSnackbar } from '@/design-system';

import { SettingsDeps } from './deps';

export function useDeleteAllData() {
  const { clearAllData, loadDemoData } = SettingsDeps.useDeps();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const queryClient = useQueryClient();
  const refreshAll = () =>
    Promise.all(
      [queryKeys.babies, queryKeys.tracking, queryKeys.health, queryKeys.reports].map((queryKey) =>
        queryClient.resetQueries({ queryKey }),
      ),
    );
  const mutation = useMutation({
    mutationFn: clearAllData,
    onSuccess: async (undo) => {
      await refreshAll();
      snackbar.show({
        message: t('settings.allDeleted'),
        action: {
          label: t('common.undo'),
          onPress: () => {
            void undo().then(refreshAll);
          },
        },
      });
    },
  });
  return {
    deleting: mutation.isPending,
    loadDemo: async () => {
      loadDemoData();
      await refreshAll();
      snackbar.show({ message: t('settings.demoLoaded') });
    },
    deleteAll: async () => {
      const yes = await confirmAsync({
        title: t('settings.deleteAllTitle'),
        message: t('settings.deleteAllBody'),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        destructive: true,
      });
      if (yes) mutation.mutate();
    },
  };
}
