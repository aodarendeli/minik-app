# DOMAIN

Pure TypeScript. Illustrative types; refine in slices. Instants are epoch-ms UTC (`Instant` branded number).
IDs are client-generated UUID strings (branded per entity).

## Entities
```ts
Baby        { id; name; birthDate: LocalDate; avatar: { colorKey; emoji? }; createdAt; updatedAt; archivedAt? }

type CareEvent = FeedingEvent | DiaperEvent | SleepEvent | NoteEvent
EventBase   { id; babyId; startedAt: Instant; endedAt?: Instant; note?: string;
              createdAt; updatedAt; deletedAt?: Instant; version: number }   // soft delete + version for future sync
FeedingEvent = EventBase & { kind: 'feeding'; method: 'breast'|'bottle'|'solid';
              breast?: { segments: { side: 'left'|'right'; startedAt: Instant; endedAt: Instant }[] }
              bottle?: { amountMl: number; content: 'breastMilk'|'formula'|'other' }
              solid?:  { items: string[] } }
DiaperEvent  = EventBase & { kind: 'diaper'; type: 'wet'|'dirty'|'mixed'|'dry' }   // startedAt = time of change
SleepEvent   = EventBase & { kind: 'sleep' }                                         // endedAt set when finished
NoteEvent    = EventBase & { kind: 'note' }

ActiveSession { id; babyId; kind: 'breastFeeding'|'sleep'; status: 'running'|'paused'; startedAt: Instant;
                segments: { side?: 'left'|'right'; startedAt: Instant; endedAt?: Instant }[];  // last open = running
                updatedAt }
ReminderSettings { babyId; nextFeed: { enabled; intervalMin }; stillRunningNudge: { enabled; afterMin };
                   quietHours: { enabled; start: 'HH:mm'; end: 'HH:mm' } }
Settings     { locale; units: { volume: 'ml'|'oz'; weight: 'kg'|'lb' }; theme: 'system'|'light'|'dark'|'night'; autoNight; haptics }
GrowthMeasurement (later) { id; babyId; at; weightG?; heightMm?; headMm? }

// health feature (implemented)
LabTest   { id; babyId; takenOn: LocalDate; category: 'blood'|'urine'|'stool'|'screening'|'hearing'|'other';
            title; labName?; note?; results: LabResult[]; createdAt; updatedAt; deletedAt?; version }
LabResult { id; analyte; value: number; unit; refLow?; refHigh? }     // range copied from the lab sheet by the user
RangePosition = 'below'|'within'|'above'|'noRange'                     // descriptive only, never a judgement
LabPreset { key; category; title; analytes: { analyte; unit }[] }      // no ranges in presets, ever

// reports feature (implemented)
ReportPeriod = 'day'|'week'; ReportSection = 'feeding'|'sleep'|'diaper'|'labs'|'log'
ReportModel { baby; period; range; fromDate; toDate; generatedAt; sections; totals: CareSummary;
              days: { date; summary }[]; averages { feeds; bottleMl; diapers; sleepMs }; events (oldest first); labs }
```
Implemented baby shape: `Baby { id; name; birthDate; sex: 'girl'|'boy'|'unspecified'; color: 'teal'|'coral'|'indigo'|'green'|'amber'; ... }`.
Canonical storage units are metric (ml, g, mm). Convert only for display/input.

## Derived (pure functions, unit-tested)
```ts
elapsedMs(session, now)   = sum(seg.endedAt ?? now) - seg.startedAt)      // pause = no open segment
sideDurations(session, now) -> { leftMs, rightMs }
lastFeeding(events) ; suggestedNextSide(lastFeeding) = opposite of last segment's side
nextFeedAt(lastFeeding, intervalMin) ; dailySummary(events, dayRange, tz)   // counts, totals, averages
isLikelyForgotten(session, now, maxMin)
```
Implemented names: `summarize(events, range) -> CareSummary` (sleep clipped to range; point events by start),
`lastBreastSide` ignores zero-length segments, `rangePosition`, `analyteHistory`, `buildReport` (pure; averages per day).
Day ranges come from `core/time` (`dayRange`, `dayRanges`, `startOfLocalWeek` Monday-based, DST-safe via local calendar).
Day boundaries use the device time zone; summary functions take `tz`/range explicitly.

## Session state machine
`idle -> running(side) <-> paused`; `running -> running(otherSide)` (SwitchSide closes current segment, opens new);
`stop` closes the open segment, builds a `FeedingEvent` from segments, deletes the session — **atomically**
(either both happen or neither). One active session per (baby, kind). All transitions are idempotent
(double-tap / duplicate notification action safe).

## Use cases (each returns Result<T, AppError>; ports injected)
Babies: `CreateBaby, UpdateBaby, ArchiveBaby, ListBabies`.
Sessions: `StartSession, SwitchSide, PauseSession, ResumeSession, StopSession, DiscardSession, GetActiveSessions, RestoreSessionsOnLaunch`.
Events: `LogDiaper, LogBottle, LogSolid, AddPastEvent, UpdateEvent, DeleteEvent (soft), RestoreEvent (undo), GetTimeline(range|cursor), GetDailySummary`.
Reminders: `SyncReminders(babyId)` (idempotent: cancel + recreate from state), `UpdateReminderSettings`.
Settings: `GetSettings, UpdateSettings`.
Health: `ListLabTests, GetLabTest, SaveLabTest (create/update, bumps version), DeleteLabTest (soft), RestoreLabTest, GetAnalyteHistory`.
Reports: `PrepareReport({ babyId, period, days, sections }) -> ReportModel`, `ExportPdf({ html, fileName, title })`.
HTML rendering is presentation (`reports/presentation/report-html.ts`, i18n-aware, escapes all user text).

## Ports (domain/ports.ts)
```ts
BabyRepository, CareEventRepository { add, update, softDelete, restore, getById, listInRange(babyId, from, to),
  listPage(babyId, cursor?, limit), latest(babyId, kind?) }
ActiveSessionRepository { get(babyId, kind), listAll, save, remove }
ReminderRepository, SettingsRepository
Clock, IdGenerator
TimerPresencePort, ReminderSchedulerPort, HapticsPort, PermissionPort      // implemented in platform
LabTestRepository { listByBaby, listInRange(babyId, fromDate, toDate), getById, save }
ReportExporter { exportPdf(doc) }        // platform/pdf-exporter.ts: expo-print -> expo-sharing (web: print dialog)
```
Memory + MMKV implementations ship first. A shared **contract test suite** runs against every repository implementation
(memory now, http later) so behavior stays identical.

## Invariants
- `endedAt >= startedAt`; breast segments non-overlapping and ordered; amounts > 0 and <= sane max (validated, configurable).
- Overlapping events are allowed (warn in UI), never silently altered.
- Editing bumps `updatedAt` and `version`; deletes are soft until a purge job (later).
- Dummy fixtures must include: empty baby, busy day, twins, DST transition day, event crossing midnight.

## Tips content (static module)
`features/tips/data/content/<locale>/*.json`: `{ id, title, body, source: {name,url}, lastReviewed, tags }`. Content is data, not code.
