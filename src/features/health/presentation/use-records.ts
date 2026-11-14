import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import { toLocalDate, type LocalDate } from '@/core/time';
import { useActiveBaby } from '@/features/babies';
import { confirmAsync, useSnackbar } from '@/design-system';
import { parseDecimal } from '@/shared/format';

import { GROWTH_METRICS, type GrowthEntry, type GrowthMetric, type MedEntry, type MedKind } from '../domain';
import { HealthDeps } from './deps';
import { useInvalidateHealth } from './use-invalidate';

export function useGrowthQuery() {
  const { records } = HealthDeps.useDeps();
  const { baby } = useActiveBaby();
  return useQuery({
    queryKey: [...queryKeys.health, 'growth', baby?.id],
    queryFn: () => fromResult(records.listGrowth(baby?.id ?? '')),
    enabled: baby !== undefined,
  });
}

export function useMedsQuery() {
  const { records } = HealthDeps.useDeps();
  const { baby } = useActiveBaby();
  return useQuery({
    queryKey: [...queryKeys.health, 'meds', baby?.id],
    queryFn: () => fromResult(records.listMeds(baby?.id ?? '')),
    enabled: baby !== undefined,
  });
}

const toText = (n?: number) => (n === undefined ? '' : String(n).replace('.', ','));

/** Shared delete-with-undo flow for growth and med entries. */
function useDeleteRecord(remove: (id: string) => Promise<unknown>, restore: (id: string) => Promise<unknown>) {
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateHealth();
  return async (id: string) => {
    const yes = await confirmAsync({
      title: t('records.deleteTitle'),
      message: t('records.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!yes) return;
    await remove(id);
    await invalidate();
    router.back();
    snackbar.show({
      message: t('records.deleted'),
      action: { label: t('common.undo'), onPress: () => void restore(id).then(invalidate) },
    });
  };
}

export function useGrowthFormViewModel(existing?: GrowthEntry) {
  const { records, clock } = HealthDeps.useDeps();
  const { baby } = useActiveBaby();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateHealth();
  const today = toLocalDate(clock.now());
  const [measuredOn, setMeasuredOn] = useState<LocalDate>(existing?.measuredOn ?? today);
  const [values, setValues] = useState<Record<GrowthMetric, string>>({
    weightKg: toText(existing?.weightKg),
    heightCm: toText(existing?.heightCm),
    headCm: toText(existing?.headCm),
  });
  const [note, setNote] = useState(existing?.note ?? '');

  const parsed = Object.fromEntries(GROWTH_METRICS.map((m) => [m, parseDecimal(values[m])])) as Record<GrowthMetric, number | undefined>;
  const mutation = useMutation({
    mutationFn: () =>
      fromResult(
        records.saveGrowth({ babyId: existing?.babyId ?? baby?.id ?? '', measuredOn, ...parsed, note }, existing?.id),
      ),
    onSuccess: async () => {
      await invalidate();
      snackbar.show({ message: t('records.saved') });
      router.back();
    },
  });
  const errorField = mutation.error && 'message' in mutation.error ? String(mutation.error.message) : undefined;

  return {
    isEdit: existing !== undefined,
    today,
    measuredOn,
    setMeasuredOn,
    values,
    setValue: (m: GrowthMetric, v: string) => setValues((s) => ({ ...s, [m]: v })),
    note,
    setNote,
    /** Metric whose value is out of the typo-guard range, or 'empty'. */
    errorField,
    saving: mutation.isPending,
    save: () => mutation.mutate(),
    remove: useDeleteRecord(records.deleteGrowth, records.restoreGrowth),
  };
}

export function useMedFormViewModel(existing?: MedEntry, initialKind: MedKind = 'vaccine') {
  const { records, clock } = HealthDeps.useDeps();
  const { baby } = useActiveBaby();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateHealth();
  const today = toLocalDate(clock.now());
  const [kind, setKind] = useState<MedKind>(existing?.kind ?? initialKind);
  const [name, setName] = useState(existing?.name ?? '');
  const [givenOn, setGivenOn] = useState<LocalDate>(existing?.givenOn ?? today);
  const [dose, setDose] = useState(existing?.dose ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [nextOn, setNextOn] = useState<LocalDate | undefined>(existing?.nextOn);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      fromResult(
        records.saveMed({ babyId: existing?.babyId ?? baby?.id ?? '', kind, name, givenOn, dose, note, nextOn }, existing?.id),
      ),
    onSuccess: async () => {
      await invalidate();
      snackbar.show({ message: t('records.saved') });
      router.back();
    },
  });
  const nextOnError = nextOn !== undefined && nextOn <= givenOn ? t('records.nextOnError') : undefined;

  return {
    isEdit: existing !== undefined,
    today,
    fields: { kind, name, givenOn, dose, note, nextOn },
    setKind,
    setName,
    setGivenOn,
    setDose,
    setNote,
    setNextOn,
    nameError: submitted && name.trim() === '' ? t('records.nameError') : undefined,
    nextOnError,
    saving: mutation.isPending,
    error: mutation.error,
    save: () => {
      setSubmitted(true);
      if (name.trim() !== '' && !nextOnError) mutation.mutate();
    },
    remove: useDeleteRecord(records.deleteMed, records.restoreMed),
  };
}
