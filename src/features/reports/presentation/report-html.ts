import type { I18n } from '@/core/i18n';
import { MINUTE_MS, toLocalDate } from '@/core/time';
import { babyAgeLabel } from '@/features/babies';
import { formatRefRange, formatResultValue, rangePosition } from '@/features/health';
import { describeEvent } from '@/features/tracking';
import { formatDate, formatDateRange, formatDateTime, formatDurationShort, formatHours, formatNumber, formatTime } from '@/shared/format';

import type { DailyRow, ReportModel } from '../domain';
import { REPORT_CSS } from './report-styles';

/** Escapes user-provided text (names, notes, lab values) before it enters the HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

const e = escapeHtml;
const minutes = (ms: number) => String(Math.round(ms / MINUTE_MS));

type Column = { label: string; num?: boolean; cell: (row: DailyRow) => string; total?: string; avg?: string };

function dailyTable(model: ReportModel, cols: Column[], i18n: I18n): string {
  const { t } = i18n;
  const multi = model.days.length > 1;
  const head = `<tr><th>${e(t('reports.pdf.date'))}</th>${cols.map((c) => `<th class="${c.num ? 'num' : ''}">${e(c.label)}</th>`).join('')}</tr>`;
  const body = model.days
    .map((d) => `<tr><td>${e(formatDate(d.date, i18n, 'weekday'))}</td>${cols.map((c) => `<td class="${c.num ? 'num' : ''}">${e(c.cell(d))}</td>`).join('')}</tr>`)
    .join('');
  const foot = multi
    ? `<tfoot><tr><td>${e(t('reports.pdf.total'))}</td>${cols.map((c) => `<td class="num">${e(c.total ?? '')}</td>`).join('')}</tr>
       <tr><td>${e(t('reports.pdf.average'))}</td>${cols.map((c) => `<td class="num">${e(c.avg ?? '')}</td>`).join('')}</tr></tfoot>`
    : '';
  return `<table><thead>${head}</thead><tbody>${body}</tbody>${foot}</table>`;
}

function card(kind: string, label: string, value: string, sub?: string): string {
  return `<div class="card ${kind}"><div class="label">${e(label)}</div><div class="value">${e(value)}</div>${sub ? `<div class="sub">${e(sub)}</div>` : ''}</div>`;
}

function overview(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const avg = (v: string) => (m.days.length > 1 ? t('reports.avgCaption', { value: v }) : undefined);
  const parts: string[] = [];
  if (m.sections.includes('feeding')) parts.push(card('feeding', t('reports.pdf.feeds'), String(m.totals.feeding.total), avg(formatNumber(m.averages.feeds, i18n))));
  if (m.sections.includes('diaper')) parts.push(card('diaper', t('reports.pdf.diapers'), String(m.totals.diaper.total), avg(formatNumber(m.averages.diapers, i18n))));
  if (m.sections.includes('sleep')) parts.push(card('sleep', t('care.sleep'), formatDurationShort(m.totals.sleep.totalMs, i18n), avg(formatDurationShort(m.averages.sleepMs, i18n))));
  if (m.sections.includes('labs')) parts.push(card('labs', t('reports.pdf.labs'), String(m.labs.length)));
  return parts.length ? `<h2>${e(t('reports.pdf.overview'))}</h2><div class="cards">${parts.join('')}</div>` : '';
}

function feeding(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const f = m.totals.feeding;
  const n = m.days.length;
  return `<h2 class="feeding">${e(t('reports.section.feeding'))}</h2>${dailyTable(m, [
    { label: t('reports.pdf.feeds'), num: true, cell: (d) => String(d.summary.feeding.total), total: String(f.total), avg: formatNumber(f.total / n, i18n) },
    { label: t('reports.pdf.breastMin'), num: true, cell: (d) => minutes(d.summary.feeding.breastMs), total: minutes(f.breastMs), avg: minutes(f.breastMs / n) },
    { label: t('reports.pdf.leftRight'), num: true, cell: (d) => `${minutes(d.summary.feeding.leftMs)} / ${minutes(d.summary.feeding.rightMs)}`, total: `${minutes(f.leftMs)} / ${minutes(f.rightMs)}` },
    { label: t('reports.pdf.bottleMl'), num: true, cell: (d) => String(d.summary.feeding.bottleMl), total: String(f.bottleMl), avg: formatNumber(f.bottleMl / n, i18n, 0) },
    { label: t('reports.pdf.solids'), num: true, cell: (d) => String(d.summary.feeding.solid), total: String(f.solid) },
  ], i18n)}`;
}

function sleep(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const s = m.totals.sleep;
  return `<h2 class="sleep">${e(t('reports.section.sleep'))}</h2>${dailyTable(m, [
    { label: t('reports.pdf.sleepHours'), num: true, cell: (d) => formatHours(d.summary.sleep.totalMs, i18n), total: formatHours(s.totalMs, i18n), avg: formatHours(m.averages.sleepMs, i18n) },
    { label: t('reports.pdf.naps'), num: true, cell: (d) => String(d.summary.sleep.count), total: String(s.count) },
    { label: t('reports.pdf.longestSleep'), num: true, cell: (d) => formatDurationShort(d.summary.sleep.longestMs, i18n), total: formatDurationShort(s.longestMs, i18n) },
  ], i18n)}`;
}

function diaper(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const d0 = m.totals.diaper;
  const wdm = (x: { wet: number; dirty: number; mixed: number }) => `${x.wet} / ${x.dirty} / ${x.mixed}`;
  return `<h2 class="diaper">${e(t('reports.section.diaper'))}</h2>${dailyTable(m, [
    { label: t('reports.pdf.diapers'), num: true, cell: (d) => String(d.summary.diaper.total), total: String(d0.total), avg: formatNumber(m.averages.diapers, i18n) },
    { label: t('reports.pdf.wetDirty'), num: true, cell: (d) => wdm(d.summary.diaper), total: wdm(d0) },
    { label: t('care.diaperType.dry'), num: true, cell: (d) => String(d.summary.diaper.dry), total: String(d0.dry) },
  ], i18n)}`;
}

function labs(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  if (m.labs.length === 0) return `<h2 class="labs">${e(t('reports.section.labs'))}</h2><p class="muted">${e(t('reports.pdf.noData'))}</p>`;
  const blocks = m.labs.map((test) => {
    const meta = [formatDate(test.takenOn, i18n, 'long'), t(`health.category.${test.category}`), test.labName].filter(Boolean).join(' · ');
    const rows = test.results
      .map((r) => {
        const p = rangePosition(r);
        const cls = '';
        return `<tr><td>${e(r.analyte)}</td><td class="num">${e(formatResultValue(r, i18n))}</td><td class="num">${e(formatRefRange(r, i18n) ?? '—')}</td><td><span class="pill ${cls}">${e(t(`health.position.${p}`))}</span></td></tr>`;
      })
      .join('');
    const table = rows
      ? `<table><thead><tr><th>${e(t('reports.pdf.analyte'))}</th><th class="num">${e(t('reports.pdf.result'))}</th><th class="num">${e(t('reports.pdf.reference'))}</th><th>${e(t('reports.pdf.status'))}</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<p class="muted">${e(t('health.noResults'))}</p>`;
    return `<div class="lab-title">${e(test.title)} <span class="muted">· ${e(meta)}</span></div>${test.note ? `<div class="muted">${e(test.note)}</div>` : ''}${table}`;
  });
  return `<h2 class="labs">${e(t('reports.section.labs'))}</h2>${blocks.join('')}`;
}

function growth(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const head = `<h2 class="growth">${e(t('reports.section.growth'))}</h2>`;
  if (m.growth.length === 0) return `${head}<p class="muted">${e(t('reports.pdf.noData'))}</p>`;
  const v = (n: number | undefined) => (n === undefined ? '—' : formatNumber(n, i18n, 2));
  const rows = m.growth
    .map(
      (g) =>
        `<tr><td>${e(formatDate(g.measuredOn, i18n, 'long'))}</td><td class="num">${e(v(g.weightKg))}</td><td class="num">${e(v(g.heightCm))}</td><td class="num">${e(v(g.headCm))}</td><td>${e(g.note ?? '')}</td></tr>`,
    )
    .join('');
  return `${head}<table><thead><tr><th>${e(t('reports.pdf.date'))}</th><th class="num">${e(t('reports.pdf.weightKg'))}</th><th class="num">${e(t('reports.pdf.heightCm'))}</th><th class="num">${e(t('reports.pdf.headCm'))}</th><th>${e(t('common.note'))}</th></tr></thead><tbody>${rows}</tbody></table><p class="muted">${e(t('reports.pdf.growthNote'))}</p>`;
}

function meds(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const head = `<h2 class="meds">${e(t('reports.section.meds'))}</h2>`;
  if (m.meds.length === 0) return `${head}<p class="muted">${e(t('reports.pdf.noData'))}</p>`;
  const rows = m.meds
    .map(
      (x) =>
        `<tr><td>${e(formatDate(x.givenOn, i18n, 'long'))}</td><td>${e(t(`records.kinds.${x.kind}`))}</td><td>${e(x.name)}</td><td>${e(x.dose ?? '—')}</td><td>${e(x.nextOn ? formatDate(x.nextOn, i18n, 'long') : '—')}</td><td>${e(x.note ?? '')}</td></tr>`,
    )
    .join('');
  return `${head}<table><thead><tr><th>${e(t('reports.pdf.date'))}</th><th>${e(t('reports.pdf.type'))}</th><th>${e(t('records.name'))}</th><th>${e(t('reports.pdf.dose'))}</th><th>${e(t('records.nextOn'))}</th><th>${e(t('common.note'))}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function log(m: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  if (m.events.length === 0) return `<h2>${e(t('reports.section.log'))}</h2><p class="muted">${e(t('reports.pdf.noData'))}</p>`;
  let current = '';
  const rows = m.events
    .map((ev) => {
      const day = toLocalDate(ev.startedAt);
      const d = describeEvent(ev, i18n);
      const dayRow = day !== current ? `<tr><td class="day" colspan="3">${e(formatDate(day, i18n, 'weekday'))}</td></tr>` : '';
      current = day;
      const detail = [d.detail, ev.note].filter(Boolean).join(' · ');
      return `${dayRow}<tr><td>${e(formatTime(ev.startedAt, i18n))}</td><td>${e(d.title)}</td><td>${e(detail)}</td></tr>`;
    })
    .join('');
  return `<h2>${e(t('reports.section.log'))}</h2><table><thead><tr><th>${e(t('reports.pdf.time'))}</th><th>${e(t('reports.pdf.type'))}</th><th>${e(t('reports.pdf.detail'))}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function reportTitle(model: ReportModel, i18n: I18n): string {
  return i18n.t(model.period === 'day' ? 'reports.pdf.dailyHeading' : 'reports.pdf.weeklyHeading');
}

export function reportFileName(model: ReportModel): string {
  const safe = model.baby.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'bebek';
  return model.fromDate === model.toDate ? `${safe}-${model.fromDate}` : `${safe}-${model.fromDate}_${model.toDate}`;
}

/** Full printable HTML document for expo-print. */
export function renderReportHtml(model: ReportModel, i18n: I18n): string {
  const { t } = i18n;
  const renderers = { feeding, sleep, diaper, growth, meds, labs, log } as const;
  const body = model.sections.map((s) => renderers[s](model, i18n)).join('');
  const meta = [
    [t('reports.pdf.baby'), model.baby.name],
    [t('reports.pdf.birthDate'), formatDate(model.baby.birthDate, i18n, 'long')],
    [t('reports.pdf.age'), babyAgeLabel(model.baby, model.toDate, i18n)],
    [t('reports.pdf.period'), formatDateRange(model.fromDate, model.toDate, i18n)],
  ]
    .map(([k, v]) => `<span>${e(k ?? '')}</span><b>${e(v ?? '')}</b>`)
    .join('');
  return `<!DOCTYPE html><html lang="${i18n.locale}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${e(reportTitle(model, i18n))}</title><style>${REPORT_CSS}</style></head><body>
<header><div><div class="brand">${e(t('app.name').toUpperCase())}</div><h1>${e(reportTitle(model, i18n))}</h1></div><div class="meta">${meta}</div></header>
${overview(model, i18n)}${body}
<footer>${e(t('common.disclaimer'))}<br/>${e(t('reports.pdf.footer'))} ${e(t('reports.pdf.generatedAt'))}: ${e(formatDateTime(model.generatedAt, i18n))}</footer>
</body></html>`;
}
