import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import { fromResult, queryKeys } from '@/core/query';
import { addLocalDays, dayRanges, startOfLocalDay, startOfLocalWeek } from '@/core/time';
import { useActiveBaby } from '@/features/babies';
import { useSnackbar } from '@/design-system';
import { formatError } from '@/shared/format';

import { REPORT_SECTIONS, type ReportPeriod, type ReportSection } from '../domain';
import { ReportsDeps } from './deps';
import { renderReportHtml, reportFileName, reportTitle } from './report-html';

export function useReportsViewModel() {
  const { useCases, clock } = ReportsDeps.useDeps();
  const { baby } = useActiveBaby();
  const i18n = useI18n();
  const snackbar = useSnackbar();
  const [period, setPeriodState] = useState<ReportPeriod>('week');
  const [offset, setOffset] = useState(0);
  const [sections, setSections] = useState<ReportSection[]>([...REPORT_SECTIONS]);

  const now = clock.now();
  const length = period === 'day' ? 1 : 7;
  const anchor = period === 'day' ? startOfLocalDay(now) : startOfLocalWeek(now);
  const days = dayRanges(addLocalDays(anchor, offset * length), length);

  const query = useQuery({
    queryKey: [...queryKeys.reports, baby?.id, period, days[0]?.date, sections.join(',')],
    queryFn: () => fromResult(useCases.prepareReport({ babyId: baby?.id ?? '', period, days, sections })),
    enabled: baby !== undefined,
  });

  const exporter = useMutation({
    mutationFn: async () => {
      const model = query.data;
      if (!model) return;
      const html = renderReportHtml(model, i18n);
      await fromResult(useCases.exportPdf({ html, fileName: reportFileName(model), title: reportTitle(model, i18n) }));
    },
    onError: (error) => snackbar.show({ message: formatError(error, i18n) }),
  });

  return {
    period,
    setPeriod: (p: ReportPeriod) => {
      setPeriodState(p);
      setOffset(0);
    },
    previous: () => setOffset((o) => o - 1),
    next: () => setOffset((o) => Math.min(0, o + 1)),
    canGoNext: offset < 0,
    sections,
    toggleSection: (s: ReportSection) =>
      setSections((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])),
    allSections: REPORT_SECTIONS,
    loading: query.isLoading,
    error: query.error,
    model: query.data,
    exporting: exporter.isPending,
    exportPdf: () => exporter.mutate(),
  };
}
