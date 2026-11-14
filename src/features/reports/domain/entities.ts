import type { DayRange, Instant, LocalDate, TimeRange } from '@/core/time';
import type { Baby } from '@/features/babies/domain';
import type { GrowthEntry, LabTest, MedEntry } from '@/features/health/domain';
import { isActive, summarize, type CareEvent, type CareSummary } from '@/features/tracking/domain';

export type ReportPeriod = 'day' | 'week';
export type ReportSection = 'feeding' | 'sleep' | 'diaper' | 'growth' | 'meds' | 'labs' | 'log';
export const REPORT_SECTIONS: readonly ReportSection[] = ['feeding', 'sleep', 'diaper', 'growth', 'meds', 'labs', 'log'];
/** Growth is a trajectory: the latest measurements up to the report end, not only those inside the range. */
export const REPORT_GROWTH_MAX = 12;
export const REPORT_MEDS_MAX = 30;

export type DailyRow = { date: LocalDate; summary: CareSummary };

export type ReportModel = {
  baby: Baby;
  period: ReportPeriod;
  range: TimeRange;
  fromDate: LocalDate;
  toDate: LocalDate;
  generatedAt: Instant;
  sections: ReportSection[];
  totals: CareSummary;
  days: DailyRow[];
  averages: { feeds: number; bottleMl: number; diapers: number; sleepMs: number };
  /** Chronological (oldest first) for a readable log. */
  events: CareEvent[];
  labs: LabTest[];
  /** Oldest first, up to the report end date. */
  growth: GrowthEntry[];
  /** Oldest first, given up to the report end date. */
  meds: MedEntry[];
};

export type BuildReportInput = {
  baby: Baby;
  period: ReportPeriod;
  days: readonly DayRange[];
  events: readonly CareEvent[];
  labs: readonly LabTest[];
  growth?: readonly GrowthEntry[];
  meds?: readonly MedEntry[];
  sections: readonly ReportSection[];
  generatedAt: Instant;
};

/** Pure: aggregates raw data into a printable report model. Averages are per calendar day in the range. */
export function buildReport(input: BuildReportInput): ReportModel {
  const first = input.days[0];
  const last = input.days[input.days.length - 1];
  if (!first || !last) throw new Error('Report needs at least one day');
  const range = { from: first.from, to: last.to };
  const active = input.events.filter(isActive);
  const days = input.days.map((d) => ({ date: d.date, summary: summarize(active, d) }));
  const totals = summarize(active, range);
  const n = days.length;
  return {
    baby: input.baby,
    period: input.period,
    range,
    fromDate: first.date,
    toDate: last.date,
    generatedAt: input.generatedAt,
    sections: REPORT_SECTIONS.filter((s) => input.sections.includes(s)),
    totals,
    days,
    averages: {
      feeds: totals.feeding.total / n,
      bottleMl: totals.feeding.bottleMl / n,
      diapers: totals.diaper.total / n,
      sleepMs: totals.sleep.totalMs / n,
    },
    events: [...active].sort((a, b) => a.startedAt - b.startedAt),
    labs: input.labs
      .filter((t) => t.deletedAt === undefined && t.takenOn >= first.date && t.takenOn <= last.date)
      .sort((a, b) => a.takenOn.localeCompare(b.takenOn)),
    growth: (input.growth ?? [])
      .filter((g) => g.deletedAt === undefined && g.measuredOn <= last.date)
      .sort((a, b) => a.measuredOn.localeCompare(b.measuredOn))
      .slice(-REPORT_GROWTH_MAX),
    meds: (input.meds ?? [])
      .filter((m) => m.deletedAt === undefined && m.givenOn <= last.date)
      .sort((a, b) => a.givenOn.localeCompare(b.givenOn))
      .slice(-REPORT_MEDS_MAX),
  };
}
