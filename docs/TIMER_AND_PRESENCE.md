# TIMER AND PRESENCE

Requirement: a feeding timer keeps counting and stays visible/controllable with the screen off, from the notification
shade / lock screen, and survives app kill. Plus reminders that fire when the app is closed.

## Core principle
**Never count. Derive.** The truth is persisted timestamps (`ActiveSession.segments`). Elapsed =
`sum(segment durations)` computed from `Clock.now()`. UI re-renders at 1 Hz only to display. Backgrounding, JS pause,
process death and clock drift cannot corrupt it. Persist on every transition, before any UI/native side effect.

## Current implementation (2026-11-10, Expo Go phase)
- Port: `SessionPresencePort { show(session), hide(sessionId) }` in `features/tracking/domain/ports.ts`. Tracking use-cases
  call it **after** persisting (start, switch, pause, resume, backdate, correct side -> show; stop, discard -> hide) and swallow
  its errors. `restorePresence()` re-posts all persisted sessions on launch and on locale change.
- Adapter: `platform/session-presence.ts` (expo-notifications): one local notification per session, id `session_<id>`,
  Android channel `session` (LOW, silent), `sticky: true`; categories with buttons (Switch side / Pause / Finish, Resume / Finish).
  Buttons use `opensAppToForeground: true`; `SessionPresenceBridge` (composition) runs them through the same use-cases and replays
  a tap that cold-started the app (`getLastNotificationResponse`). In-app banners are suppressed for session notifications.
  Text is static because expo-notifications has no chronometer, so only facts that stay true are shown:
  title `🤱 Deniz · Emzirme`, iOS subtitle `Şu an Sağ taraf`, body `Başlangıç 14:05 · Sol 8 dk tamamlandı` + a hint line
  ("basılı tut / aşağı çek" for buttons); paused: `⏸️ … duraklatıldı`, `Toplam 12 dk · Sol 8 dk · Sağ 4 dk`; sleep `🌙 Deniz uyuyor`.
  Android accent color = care color (feeding/sleep). Re-posted every time the app goes to background. Web: no-op adapter.
- Permission is requested on the first timer start (contextual). Denied -> timer still works in-app.

## Testing in Expo Go (now)
1. Start a feed -> press Home -> pull down the notification shade: "Deniz · Emzirme sürüyor / Sol taraf · 14:05 itibarıyla".
2. Tap "Taraf değiştir" (opens the app) -> timer shows the other side; notification text updates.
3. "Duraklat" -> notification shows "Duraklatıldı · N dk"; "Devam et" resumes.
4. Swipe the app away from recents mid-feed -> reopen -> timer restored with correct elapsed time (persisted).
5. Tap "Bitir" from the notification -> feed saved; notification removed.
6. Start then discard within 10 s -> no dialog; stop before 30 s -> "Çok kısa sürdü" and nothing saved.
7. Deny notification permission (fresh install) -> in-app timer still works.
Expo Go caveats: the permission prompt and notification icon belong to Expo Go; on Android 14+ a sticky notification can still
be swiped away (it is re-posted on next app open); buttons always open the app.

## Ports (domain/core) and adapters (platform) — target design
```ts
interface TimerPresencePort {
  isSupported(): boolean
  show(view: SessionPresenceView): Promise<void>     // idempotent upsert
  hide(sessionId: string): Promise<void>
}
// SessionPresenceView: { id, babyName, title, subtitle(side/paused), running, chronometerBase: Instant (now - elapsed),
//                        actions: ('switch'|'pause'|'resume'|'stop')[], labels (already i18n'd) }
interface ReminderSchedulerPort { sync(plan: ReminderPlan): Promise<void>; cancelAll(babyId): Promise<void> }
```
Adapters: `AndroidOngoingNotificationPresence`, `IosLiveActivityPresence`, `NoopPresence` (Expo Go/web/tests),
`ExpoReminderScheduler`. Domain never knows which one runs.

## Orchestration
`SessionPresenceCoordinator` (platform/app level) subscribes to session changes (after each use-case) and calls
`presence.show/hide`. Also runs on app launch (`RestoreSessionsOnLaunch`) and on locale change.

## Android: ongoing chronometer notification
- Ongoing, non-dismissible-by-swipe where the OS allows, channel `session` with LOW importance (no sound, no heads-up),
  `onlyAlertOnce`, chronometer enabled with `when = chronometerBase`, counting up. **The system renders the ticking;
  no foreground service and no background JS loop are needed** — avoids FGS type/permission/Play-policy overhead.
- Update the notification only on state change: switch side, pause (static text, chronometer off), resume
  (`chronometerBase = now - elapsed`), stop (cancel).
- Action buttons: Switch side | Pause/Resume | Stop. Taps are delivered to a **background event handler** (headless JS).
  The handler uses the same container/use-cases (`createContainer` without React), then refreshes the notification.
  Handlers must be idempotent and register at module load (before React mounts).
- Permission: `POST_NOTIFICATIONS` (Android 13+). Ask with context (after the first timer start), handle denial gracefully
  (in-app timer still works; show a gentle settings hint).
- Caveats to verify on real devices: Android 14+ lets users swipe away some ongoing notifications (we re-post on app open);
  OEM battery managers; Do-Not-Disturb; notification does not survive reboot (session does; re-show on next launch).
- Library: `react-native-notify-kit` (maintained Notifee fork; New Architecture only; Expo dev-build config plugin). Notifee
  itself was archived. Vet per DECISIONS.md before adopting; keep it behind the port so it is swappable.

## iOS: Live Activity (Lock Screen + Dynamic Island)
- iOS cannot run a ticking background timer. A Live Activity renders a **system timer text** from a start date, so it keeps
  counting with no app code running. Start it from the foreground on session start; update on pause/resume/side switch; end on stop.
- Use Expo's first-party `expo-widgets` (Live Activities as React components; stable since SDK 56 per Expo) — verify in
  current docs. Alternatives: `expo-live-activity` (early-stage), Voltra. Keep behind `TimerPresencePort`.
- Constraints to verify: iOS 16.2+; user can disable Live Activities; max lifetime limits (hours) — fine for feeds, enforce a
  max-duration prompt; interactive buttons need App Intents (iOS 17+) — treat as phase 2. Requires Apple Developer account,
  entitlements, dev build; cannot be tested in Expo Go or the simulator-only for all behaviors.
- Fallback when unsupported/disabled: in-app timer + reminder notification only.

## Reminders (local scheduled notifications)
- Use `expo-notifications` scheduled triggers (works when the app is closed). Types: **next feed**
  (lastFeeding.endedAt + interval), **still running?** nudge (session start + N min).
- `SyncReminders(babyId)` is the single entry point: compute the desired plan from state, cancel old identifiers (deterministic IDs
  like `nextFeed:<babyId>`), schedule new. Call after: feed stop, feed start (cancel next-feed), settings change, baby archive,
  launch, time-zone change.
- Quiet hours: shift or skip per setting; document the rule. Android channels: `reminders` (default importance).
- Exact alarms: default to inexact scheduling. Do not request exact-alarm permissions unless the product needs minute-level
  precision (Play policy restricts exact-alarm permissions). Log the decision in DECISIONS.md if changed.
- Handle DST/time-zone changes by recomputing on app foreground.

## Multiple sessions (twins)
One presence item per session (`id`-keyed). Titles include baby name. Android: separate notification IDs; iOS: one Live
Activity per session (mind per-app limits).

## Test strategy
- Unit: elapsed math, state machine, idempotency, reminder plan computation (fake Clock, DST cases).
- Integration: use-cases with fake presence port; handler invoked twice -> same result.
- Manual device QA checklist (tester outputs this, humans run it):
  1. Start feed -> lock screen 10 min -> elapsed correct, notification ticking.
  2. Stop from notification with app closed -> event exists on next open with correct duration.
  3. Swipe app away mid-session -> reopen -> session restored.
  4. Switch side / pause / resume from notification -> durations per side correct.
  5. Deny notification permission -> in-app flow still fully works.
  6. Battery saver + DND on. 7. Change time zone / DST boundary. 8. Reboot mid-session -> session restored on launch.
  9. Two babies concurrently. 10. Reminder fires with app killed; cancelled when a new feed starts.
