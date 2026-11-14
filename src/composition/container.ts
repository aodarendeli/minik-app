import { createI18n } from '@/core/i18n';
import { uuidGenerator, type IdGenerator } from '@/core/ids';
import type { KeyValueStorage } from '@/core/storage/key-value';
import { Table } from '@/core/storage/table';
import { addLocalDays, fromLocalDate, HOUR_MS, systemClock, type Clock } from '@/core/time';
import { LocalBabyRepository } from '@/features/babies/data/baby.local-repository';
import { DEMO_BABY_AGE_DAYS, DEMO_BABY_ID, demoBabies } from '@/features/babies/data/fixtures';
import { createBabyUseCases, type Baby } from '@/features/babies/domain';
import { demoLabTests } from '@/features/health/data/fixtures';
import { LocalLabTestRepository } from '@/features/health/data/lab.local-repository';
import { LAB_PRESETS } from '@/features/health/data/presets';
import { LocalRecordRepository } from '@/features/health/data/record.local-repository';
import {
  createHealthUseCases,
  createRecordUseCases,
  REMINDER_HOUR,
  type GrowthEntry,
  type LabTest,
  type MedEntry,
  type ReminderPort,
} from '@/features/health/domain';
import { createReportUseCases } from '@/features/reports/domain';
import { LocalSettingsRepository } from '@/features/settings/data/settings.local-repository';
import { createSettingsUseCases } from '@/features/settings/domain';
import { demoCareEvents } from '@/features/tracking/data/fixtures';
import { LocalActiveSessionRepository, LocalCareEventRepository } from '@/features/tracking/data/tracking.local-repository';
import {
  createTrackingUseCases,
  currentSide,
  elapsedMs,
  sideDurations,
  type ActiveSession,
  type CareEvent,
} from '@/features/tracking/domain';
import { light as lightColors } from '@minik/design-tokens';
import { expoPdfExporter } from '@/platform/pdf-exporter';
import { createSessionPresence } from '@/platform/session-presence';
import type { DescribeSession, SessionPresenceAdapter } from '@/platform/session-presence.types';
import { createReminders } from '@/platform/reminders';
import type { DescribeReminder } from '@/platform/reminders.types';
import { deviceStorage } from '@/platform/storage';
import { formatDurationShort, formatTime } from '@/shared/format';

/** Storage keys are versioned so a future schema change can migrate explicitly. */
const PREFIX = 'minik.v1';
const KEYS = {
  babies: `${PREFIX}.babies`,
  events: `${PREFIX}.events`,
  sessions: `${PREFIX}.sessions`,
  labs: `${PREFIX}.labs`,
  growth: `${PREFIX}.growth`,
  meds: `${PREFIX}.meds`,
  settings: `${PREFIX}.settings`,
};

export type ContainerOptions = {
  clock?: Clock;
  ids?: IdGenerator;
  storage?: KeyValueStorage;
  /** Seed demo data on first launch only (a table that was never written). Off by default: onboarding adds the baby. */
  seedDemoData?: boolean;
  presence?: (describe: DescribeSession) => SessionPresenceAdapter;
  reminders?: (describe: DescribeReminder) => ReminderPort;
};

/**
 * Composition root: wires ports to adapters. Runs without React so headless tasks can reuse it.
 * All data stays on the device.
 */
export function createContainer({
  clock = systemClock,
  ids = uuidGenerator,
  storage = deviceStorage,
  seedDemoData = false,
  presence: createPresence = createSessionPresence,
  reminders: createReminderPort = createReminders,
}: ContainerOptions = {}) {
  /** Demo data relative to `at` (first launch, or "load sample data" in development). */
  const demo = (at: number) => ({
    babies: demoBabies(at),
    events: demoCareEvents(DEMO_BABY_ID, at),
    labs: demoLabTests(DEMO_BABY_ID, addLocalDays(at, -DEMO_BABY_AGE_DAYS), at),
  });
  // Built lazily: only generated when a table has never been written (first launch).
  let firstLaunch: (ReturnType<typeof demo> & { sessions: ActiveSession[] }) | undefined;
  const seed = () =>
    (firstLaunch ??= seedDemoData ? { ...demo(clock.now()), sessions: [] } : { babies: [], events: [], sessions: [], labs: [] });

  const tables = {
    babies: new Table<Baby>(storage, KEYS.babies, () => seed().babies),
    events: new Table<CareEvent>(storage, KEYS.events, () => seed().events),
    sessions: new Table<ActiveSession>(storage, KEYS.sessions, () => seed().sessions),
    labs: new Table<LabTest>(storage, KEYS.labs, () => seed().labs),
    growth: new Table<GrowthEntry>(storage, KEYS.growth),
    meds: new Table<MedEntry>(storage, KEYS.meds),
  };
  const babies = new LocalBabyRepository(tables.babies);
  const events = new LocalCareEventRepository(tables.events);
  const sessions = new LocalActiveSessionRepository(tables.sessions);
  const labs = new LocalLabTestRepository(tables.labs);
  const settings = new LocalSettingsRepository(storage, KEYS.settings);

  /**
   * Notification copy, built outside React from the persisted locale. Only facts that stay true while the
   * notification sits in the shade are shown (start time, finished sides, totals while paused), never a
   * running total that would go stale.
   */
  const describe: DescribeSession = async (session) => {
    const [baby, prefs] = await Promise.all([babies.getById(session.babyId), settings.get()]);
    const i18n = createI18n(prefs.locale);
    const { t } = i18n;
    const name = baby?.name ?? t('app.name');
    const sleep = session.kind === 'sleep';
    const accentColor = sleep ? lightColors.sleep : lightColors.feeding;
    const dur = (ms: number) => formatDurationShort(ms, i18n);
    const sideName = (side: 'left' | 'right') => t(`care.${side}`);

    if (session.status === 'paused') {
      const total = t('presence.total', { duration: dur(elapsedMs(session, clock.now())) });
      const { leftMs, rightMs } = sideDurations(session.segments, clock.now());
      const split = sleep
        ? []
        : (['left', 'right'] as const)
            .filter((s) => (s === 'left' ? leftMs : rightMs) > 0)
            .map((s) => t('presence.sideTotal', { side: sideName(s), duration: dur(s === 'left' ? leftMs : rightMs) }));
      return {
        title: t(sleep ? 'presence.sleepPausedTitle' : 'presence.breastPausedTitle', { name }),
        body: [total, ...split].join(' · '),
        accentColor,
      };
    }

    const started = t('presence.startedAt', { time: formatTime(session.startedAt, i18n) });
    const side = currentSide(session);
    if (sleep || !side) {
      return { title: t('presence.sleepTitle', { name }), body: started, accentColor };
    }
    // Finished segments are stable facts; the open one is still counting, so it is not summed here.
    const closed = sideDurations(session.segments.filter((s) => s.endedAt !== undefined), clock.now());
    const completed = (['left', 'right'] as const)
      .filter((s) => (s === 'left' ? closed.leftMs : closed.rightMs) > 0)
      .map((s) => t('presence.completed', { side: sideName(s), duration: dur(s === 'left' ? closed.leftMs : closed.rightMs) }));
    return {
      title: t('presence.breastTitle', { name }),
      subtitle: t('presence.currentSide', { side: sideName(side) }),
      body: [started, ...completed].join(' · '),
      accentColor,
    };
  };
  const presence = createPresence(describe);

  /** Reminder copy, built outside React from the persisted locale (like the session notification). */
  const describeReminder: DescribeReminder = async (r) => {
    const [baby, prefs] = await Promise.all([babies.getById(r.babyId), settings.get()]);
    const { t } = createI18n(prefs.locale);
    return {
      title: t(r.kind === 'vaccine' ? 'records.reminderVaccineTitle' : 'records.reminderMedTitle', { name: baby?.name ?? t('app.name') }),
      body: t('records.reminderBody', { name: r.name }),
      channelName: t('records.reminderChannel'),
    };
  };
  const reminders = createReminderPort(describeReminder);
  const growthRepo = new LocalRecordRepository(tables.growth);
  const medRepo = new LocalRecordRepository(tables.meds);
  const records = createRecordUseCases({
    growth: growthRepo,
    meds: medRepo,
    reminders,
    clock,
    ids,
  });
  /** Re-creates reminders for restored entries (undo of a delete). */
  const rescheduleReminders = (entries: readonly MedEntry[]) =>
    Promise.all(
      entries
        .filter((m) => m.deletedAt === undefined && m.nextOn !== undefined)
        .map((m) => {
          const at = fromLocalDate(m.nextOn ?? '') + REMINDER_HOUR * HOUR_MS;
          return at > clock.now()
            ? reminders.schedule({ id: m.id, at, kind: m.kind, name: m.name, babyId: m.babyId }).catch(() => undefined)
            : undefined;
        }),
    );
  const cancelReminders = (entries: readonly MedEntry[]) =>
    Promise.all(entries.map((m) => reminders.cancel(m.id).catch(() => undefined)));

  const tracking = createTrackingUseCases({ events, sessions, clock, ids, presence });
  /** Notification cleanup must never block deleting data (throw or rejection alike). */
  const hideQuietly = (sessionId: string) =>
    Promise.resolve()
      .then(() => presence.hide(sessionId))
      .catch(() => undefined);

  return {
    clock,
    presence,
    babies: createBabyUseCases({ babies, clock, ids }),
    tracking,
    health: createHealthUseCases({ labs, clock, ids }),
    records,
    healthPresets: LAB_PRESETS,
    reports: createReportUseCases({ babies, events, labs, growth: growthRepo, meds: medRepo, exporter: expoPdfExporter, clock }),
    settings: createSettingsUseCases({ settings }),
    /**
     * "Delete all data" (privacy requirement). Settings are kept; demo data is not re-seeded.
     * Returns an `undo` that restores the snapshot. The snapshot lives only in memory (never written
     * to disk), so after the undo window or an app restart the data is really gone.
     */
    async clearAllData(): Promise<() => Promise<void>> {
      const snapshot = {
        babies: tables.babies.values(),
        events: tables.events.values(),
        sessions: tables.sessions.values(),
        labs: tables.labs.values(),
        growth: tables.growth.values(),
        meds: tables.meds.values(),
      };
      await Promise.all(snapshot.sessions.map((s) => hideQuietly(s.id)));
      await cancelReminders(snapshot.meds);
      Object.values(tables).forEach((table) => table.clear());
      return async () => {
        tables.babies.putMany(snapshot.babies);
        tables.events.putMany(snapshot.events);
        tables.sessions.putMany(snapshot.sessions);
        tables.labs.putMany(snapshot.labs);
        tables.growth.putMany(snapshot.growth);
        tables.meds.putMany(snapshot.meds);
        await rescheduleReminders(snapshot.meds);
        await tracking.restorePresence();
      };
    },

    /**
     * Deletes one baby with everything that belongs to it (entries, lab tests, running timers).
     * Returns an in-memory `undo`, like `clearAllData`.
     */
    async deleteBaby(babyId: string): Promise<() => Promise<void>> {
      const removed = {
        babies: tables.babies.removeWhere((b) => b.id === babyId),
        events: tables.events.removeWhere((e) => e.babyId === babyId),
        sessions: tables.sessions.removeWhere((s) => s.babyId === babyId),
        labs: tables.labs.removeWhere((l) => l.babyId === babyId),
        growth: tables.growth.removeWhere((g) => g.babyId === babyId),
        meds: tables.meds.removeWhere((m) => m.babyId === babyId),
      };
      await Promise.all(removed.sessions.map((s) => hideQuietly(s.id)));
      await cancelReminders(removed.meds);
      return async () => {
        tables.babies.putMany(removed.babies);
        tables.events.putMany(removed.events);
        tables.sessions.putMany(removed.sessions);
        tables.labs.putMany(removed.labs);
        tables.growth.putMany(removed.growth);
        tables.meds.putMany(removed.meds);
        await rescheduleReminders(removed.meds);
        await tracking.restorePresence();
      };
    },

    /** Development helper: (re)loads the sample baby, 14 days of entries and lab tests. */
    loadDemoData() {
      const data = demo(clock.now());
      tables.babies.putMany(data.babies);
      tables.events.putMany(data.events);
      tables.labs.putMany(data.labs);
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
