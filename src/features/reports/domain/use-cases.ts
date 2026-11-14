import { appError, toAppError } from '@/core/errors';
import { err, ok, type Result } from '@/core/result';
import type { Clock, DayRange } from '@/core/time';
import type { BabyRepository } from '@/features/babies/domain';
import type { GrowthEntry, LabTestRepository, MedEntry, RecordRepository } from '@/features/health/domain';
import type { CareEventRepository } from '@/features/tracking/domain';

import { buildReport, type ReportModel, type ReportPeriod, type ReportSection } from './entities';
import type { ReportDocument, ReportExporter } from './ports';

export type ReportDeps = {
  babies: BabyRepository;
  events: CareEventRepository;
  labs: LabTestRepository;
  growth?: RecordRepository<GrowthEntry>;
  meds?: RecordRepository<MedEntry>;
  exporter: ReportExporter;
  clock: Clock;
};

export type PrepareReportInput = {
  babyId: string;
  period: ReportPeriod;
  days: readonly DayRange[];
  sections: readonly ReportSection[];
};

export function createReportUseCases({ babies, events, labs, growth, meds, exporter, clock }: ReportDeps) {
  return {
    async prepareReport(input: PrepareReportInput): Promise<Result<ReportModel>> {
      const first = input.days[0];
      const last = input.days[input.days.length - 1];
      if (!first || !last) return err(appError('Validation', 'days'));
      try {
        const baby = await babies.getById(input.babyId);
        if (!baby) return err(appError('NotFound'));
        const [rangeEvents, rangeLabs, growthRows, medRows] = await Promise.all([
          events.listInRange(input.babyId, first.from, last.to),
          labs.listInRange(input.babyId, first.date, last.date),
          growth?.listByBaby(input.babyId) ?? [],
          meds?.listByBaby(input.babyId) ?? [],
        ]);
        return ok(
          buildReport({ ...input, baby, events: rangeEvents, labs: rangeLabs, growth: growthRows, meds: medRows, generatedAt: clock.now() }),
        );
      } catch (e) {
        return err(toAppError(e));
      }
    },

    async exportPdf(doc: ReportDocument): Promise<Result<void>> {
      try {
        await exporter.exportPdf(doc);
        return ok(undefined);
      } catch (e) {
        return err(toAppError(e));
      }
    },
  };
}

export type ReportUseCases = ReturnType<typeof createReportUseCases>;
