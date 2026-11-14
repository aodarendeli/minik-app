import type { I18n } from '@/core/i18n';
import { fromLocalDate, HOUR_MS, MINUTE_MS, type Instant, type LocalDate } from '@/core/time';

/**
 * Intl formatters are costly to build on Hermes, and lists/timers format on every render.
 * One instance per locale + options, reused for the app's lifetime (a handful of entries).
 */
const dateFormats = new Map<string, Intl.DateTimeFormat>();
const numberFormats = new Map<string, Intl.NumberFormat>();

function dateFormat(tag: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${tag}|${JSON.stringify(opts)}`;
  let f = dateFormats.get(key);
  if (!f) dateFormats.set(key, (f = new Intl.DateTimeFormat(tag, opts)));
  return f;
}

const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
const DATE_STYLES: Record<'short' | 'long' | 'weekday', Intl.DateTimeFormatOptions> = {
  short: { day: 'numeric', month: 'short' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  weekday: { weekday: 'long', day: 'numeric', month: 'long' },
};

/** Display formatting only. Storage stays UTC instants; rendering uses the device time zone. */
export function formatTime(at: Instant, i18n: I18n): string {
  return dateFormat(i18n.intlTag, TIME).format(at);
}

export function formatDate(at: Instant | LocalDate, i18n: I18n, style: 'short' | 'long' | 'weekday' = 'short'): string {
  const value = typeof at === 'string' ? fromLocalDate(at) : at;
  return dateFormat(i18n.intlTag, DATE_STYLES[style]).format(value);
}

export function formatDateTime(at: Instant, i18n: I18n): string {
  return `${formatDate(at, i18n, 'long')} ${formatTime(at, i18n)}`;
}

export function formatDurationShort(ms: number, i18n: I18n): string {
  const totalMin = Math.max(0, Math.round(ms / MINUTE_MS));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return i18n.t('units.m', { m });
  if (m === 0) return i18n.t('units.h', { h });
  return i18n.t('units.hm', { h, m });
}

export function formatAgo(ms: number, i18n: I18n): string {
  if (ms < MINUTE_MS) return i18n.t('units.justNow');
  return i18n.t('units.ago', { time: formatDurationShort(ms, i18n) });
}

export function formatNumber(n: number, i18n: I18n, maxFractionDigits = 1): string {
  const key = `${i18n.intlTag}|${maxFractionDigits}`;
  let f = numberFormats.get(key);
  if (!f) numberFormats.set(key, (f = new Intl.NumberFormat(i18n.intlTag, { maximumFractionDigits: maxFractionDigits })));
  return f.format(n);
}

export function formatHours(ms: number, i18n: I18n): string {
  return formatNumber(ms / HOUR_MS, i18n, 1);
}

export function formatRelativeDay(date: LocalDate, today: LocalDate, yesterday: LocalDate, i18n: I18n): string {
  if (date === today) return i18n.t('common.today');
  if (date === yesterday) return i18n.t('common.yesterday');
  return formatDate(date, i18n, 'weekday');
}

export function formatDateRange(from: LocalDate, to: LocalDate, i18n: I18n): string {
  return from === to ? formatDate(from, i18n, 'long') : `${formatDate(from, i18n)} – ${formatDate(to, i18n, 'long')}`;
}

/** Parses user decimal input accepting both "," and "." separators. */
export function parseDecimal(text: string): number | undefined {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : Number.NaN;
}

export function formatError(error: unknown, i18n: I18n): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : 'Unknown';
  const known = ['NotFound', 'Validation', 'Limit', 'Conflict', 'Storage', 'Network', 'Permission'] as const;
  const match = known.find((k) => k === code);
  return i18n.t(`errors.${match ?? 'Unknown'}`);
}
