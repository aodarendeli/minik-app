import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import { addLocalDays, toLocalDate } from '@/core/time';
import { confirmAsync, useSnackbar } from '@/design-system';

import { BABY_COLORS, BABY_MAX, earliestBirthDate, type Baby, type BabyColor, type BabySex } from '../domain';
import { useActiveBaby } from './active-baby';
import { BabiesDeps } from './deps';

export type BabyFormOptions = {
  /** Replaces the default "snackbar + go back" after saving (e.g. onboarding moves to its next step). */
  onSaved?: (baby: Baby) => void;
};

export function useBabyFormViewModel(editId?: string, { onSaved }: BabyFormOptions = {}) {
  const { useCases, clock, deleteBabyWithData } = BabiesDeps.useDeps();
  const { babies, select } = useActiveBaby();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const queryClient = useQueryClient();
  const existing = babies.find((b) => b.id === editId);
  const today = toLocalDate(clock.now());

  const [name, setName] = useState(existing?.name ?? '');
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? toLocalDate(addLocalDays(clock.now(), -1)));
  const [sex, setSex] = useState<BabySex>(existing?.sex ?? 'unspecified');
  const [color, setColor] = useState<BabyColor>(existing?.color ?? 'teal');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      const draft = { name, birthDate, sex, color };
      return fromResult(existing ? useCases.updateBaby(existing.id, draft) : useCases.createBaby(draft));
    },
    onSuccess: async (baby: Baby) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.babies });
      select(baby.id);
      if (onSaved) return onSaved(baby);
      snackbar.show({ message: t('babyForm.saved') });
      router.back();
    },
  });

  const resetAll = () => queryClient.resetQueries();
  const remove = useMutation({
    mutationFn: (id: string) => deleteBabyWithData(id),
    onSuccess: async (undo) => {
      await resetAll();
      router.back();
      snackbar.show({
        message: t('babyForm.deleted', { name: existing?.name ?? '' }),
        action: {
          label: t('common.undo'),
          onPress: () => {
            void undo().then(resetAll);
          },
        },
      });
    },
  });

  const nameError = submitted && name.trim().length === 0 ? t('babyForm.nameError') : undefined;

  return {
    isEdit: Boolean(existing),
    /** Creating would exceed `BABY_MAX`. */
    atLimit: !existing && babies.length >= BABY_MAX,
    maxBabies: BABY_MAX,
    today,
    earliest: earliestBirthDate(today),
    fields: { name, birthDate, sex, color },
    setName,
    setBirthDate,
    setSex,
    setColor,
    colors: BABY_COLORS,
    nameError,
    saving: mutation.isPending,
    error: mutation.error,
    deleting: remove.isPending,
    deleteBaby: async () => {
      if (!existing) return;
      const yes = await confirmAsync({
        title: t('babyForm.deleteTitle', { name: existing.name }),
        message: t('babyForm.deleteBody', { name: existing.name }),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        destructive: true,
      });
      if (yes) remove.mutate(existing.id);
    },
    save: () => {
      setSubmitted(true);
      if (name.trim().length > 0) mutation.mutate();
    },
  };
}
