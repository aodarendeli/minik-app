import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { fromResult } from '@/core/query';
import { toLocalDate } from '@/core/time';
import { useActiveBaby } from '@/features/babies';
import { confirmAsync, useSnackbar } from '@/design-system';
import { parseDecimal } from '@/shared/format';

import { LAB_RESULTS_MAX, type LabCategory, type LabPreset, type LabResultDraft, type LabTest } from '../domain';
import { HealthDeps } from './deps';
import { useInvalidateHealth } from './use-invalidate';

export type ResultRow = { key: string; id?: string; analyte: string; value: string; unit: string; refLow: string; refHigh: string };

const toText = (n?: number) => (n === undefined ? '' : String(n));
let rowSeq = 0;
const newRow = (partial: Partial<ResultRow> = {}): ResultRow => ({
  key: `row-${++rowSeq}`,
  analyte: '',
  value: '',
  unit: '',
  refLow: '',
  refHigh: '',
  ...partial,
});

/** Converts editable text rows to drafts; returns null when a filled row has an invalid number. */
function toDrafts(rows: readonly ResultRow[]): LabResultDraft[] | null {
  const out: LabResultDraft[] = [];
  for (const r of rows) {
    if (r.analyte.trim() === '') continue;
    const value = parseDecimal(r.value);
    const refLow = parseDecimal(r.refLow);
    const refHigh = parseDecimal(r.refHigh);
    if (value === undefined || Number.isNaN(value) || Number.isNaN(refLow) || Number.isNaN(refHigh)) return null;
    out.push({ id: r.id, analyte: r.analyte, value, unit: r.unit, refLow, refHigh });
  }
  return out;
}

export function useLabFormViewModel(existing?: LabTest) {
  const { useCases, clock, presets } = HealthDeps.useDeps();
  const { baby } = useActiveBaby();
  const { t } = useI18n();
  const snackbar = useSnackbar();
  const invalidate = useInvalidateHealth();
  const today = toLocalDate(clock.now());

  const [category, setCategory] = useState<LabCategory>(existing?.category ?? 'blood');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [takenOn, setTakenOn] = useState(existing?.takenOn ?? today);
  const [labName, setLabName] = useState(existing?.labName ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [rows, setRows] = useState<ResultRow[]>(
    existing?.results.map((r) =>
      newRow({
        id: r.id,
        analyte: r.analyte,
        value: String(r.value),
        unit: r.unit,
        refLow: toText(r.refLow),
        refHigh: toText(r.refHigh),
      }),
    ) ?? [newRow()],
  );
  const [presetKey, setPresetKey] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const drafts = toDrafts(rows);

  const mutation = useMutation({
    mutationFn: (results: LabResultDraft[]) =>
      fromResult(
        useCases.saveLabTest(
          { babyId: existing?.babyId ?? baby?.id ?? '', category, title, takenOn, labName, note, results },
          existing?.id,
        ),
      ),
    onSuccess: async () => {
      await invalidate();
      snackbar.show({ message: t('labForm.saved') });
      router.back();
    },
  });

  return {
    isEdit: existing !== undefined,
    today,
    presets,
    fields: { category, title, takenOn, labName, note },
    rows,
    setCategory,
    setTitle,
    setTakenOn,
    setLabName,
    setNote,
    presetKey,
    applyPreset: async (p: LabPreset) => {
      if (p.key === presetKey) return;
      // Switching templates replaces the rows: ask first if the parent already typed values.
      const typed = rows.some((r) => r.value.trim() !== '' || r.refLow.trim() !== '' || r.refHigh.trim() !== '');
      if (typed) {
        const yes = await confirmAsync({
          title: t('labForm.replaceTitle'),
          message: t('labForm.replaceBody', { name: p.title }),
          confirmLabel: t('labForm.replaceConfirm'),
          cancelLabel: t('common.cancel'),
          destructive: true,
        });
        if (!yes) return;
      }
      setPresetKey(p.key);
      setCategory(p.category);
      setTitle(p.title);
      setRows(p.analytes.map((a) => newRow(a)));
    },
    updateRow: (key: string, patch: Partial<ResultRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r))),
    canAddRow: rows.length < LAB_RESULTS_MAX,
    addRow: () => setRows((rs) => (rs.length < LAB_RESULTS_MAX ? [...rs, newRow()] : rs)),
    removeRow: (key: string) => setRows((rs) => rs.filter((r) => r.key !== key)),
    titleError: submitted && title.trim() === '' ? t('labForm.titleError') : undefined,
    valuesError: submitted && drafts === null ? t('labForm.valueError') : undefined,
    saving: mutation.isPending,
    error: mutation.error,
    save: () => {
      setSubmitted(true);
      if (title.trim() !== '' && drafts !== null) mutation.mutate(drafts);
    },
  };
}
