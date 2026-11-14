# ROADMAP

Tick `[x]` when done (developer). IDs are stable. Each slice = one analyst spec. Dependencies in `(needs: ...)`.
`[~]` = first pass done (2026-11-10 bootstrap), remaining items listed after "TODO".

## Foundation
- [~] **S00 Bootstrap** — done: TS strict (+noUncheckedIndexedAccess), skeleton, ESLint guardrails, Jest (jest-expo) + RNTL, `check`/`test:changed` scripts, alias. TODO: Prettier, CI, size baseline, `.claude/settings.json` permissions.
- [x] **S01 Tokens + theme + primitives** — in-house ThemeProvider (see DECISIONS), contrast tests pass in all 3 themes.
- [~] **S02 Headless hooks + core components + gallery** — components + CATALOG.md done. TODO: dev gallery route, Sheet/Dialog/Skeleton, per-component tests.
- [~] **S03 Core infra** — Result/AppError, Clock, ids, i18n (in-house), DI contexts, QueryClient. TODO: persistent storage (MMKV or expo-sqlite), logger, error boundary.

## Domain and data (dummy)
- [x] **S04 Domain + memory repos + fixtures**
- [x] **S05 Babies + onboarding** (create/edit, switcher, delete baby with its data + 5 s undo; archive-without-delete TODO)
- [x] **S06 Today dashboard**

## Core tracking
- [~] **S07 Breastfeeding timer (in-app)** — start/switch/pause/stop/discard, restore after kill (persisted), quick discard,
      min 30 s, backdate chips, start-side correction. TODO: forgot-timer prompt.
- [~] **S08 Timeline + edit/delete/undo + add past event** — day timeline, soft delete + undo, back-dating chips. TODO: edit event, exact time picker.
- [x] **S09 Diaper, bottle, solids quick log**
- [~] **S10 Presence** — phase 0 done: `SessionPresencePort` + Expo-notifications adapter (Expo Go, static text, buttons open
      the app, restore on launch). Remaining (dev build): Android chronometer notification + iOS Live Activity (needs S07) — ports, adapters, background action handlers, device QA checklist. *Opus-worthy.*
- [ ] **S11 Reminders** (needs S07) — next-feed + still-running nudge, quiet hours, SyncReminders.
- [~] **S12 Sleep timer** — in-app timer done; presence (S10) pending.

## Value-adds
- [~] **S13 Insights** — weekly bar charts + stat tiles inside Reports (view-based BarChart, no chart lib).
- [ ] **S14 Tips module** (needs S02) — static localized content, sources, disclaimer.
- [~] **S15 Settings** — theme (system/light/dark/night), palette, language, parent, babies. TODO: units, quiet hours, haptics, data export/delete, persistence.
- [ ] **S16 Hardening** — a11y audit, performance (FlashList, startup), size audit (Atlas review, unused deps/assets, per-dep native deltas), error states, Maestro flows, privacy screens, store prep (EAS).

## Health & reports (added 2026-11-10)
- [x] **S19 Lab tests** — categories, templates (names+units only), values with user-entered reference range, detail, edit,
      soft delete + undo, analyte history chart. TODO: attach photo/PDF of the lab sheet (needs storage decision), reminders for follow-up tests.
- [x] **S20 PDF reports** — daily/weekly, section toggles, on-screen preview, A4 HTML -> expo-print -> share sheet (web: print).
      TODO: custom date range, monthly, growth section, "include notes" toggle, test on real iOS/Android devices (fonts, page breaks).
- [~] **S21 Persistence** — interim done: expo-sqlite kv-store + `Table` (JSON per table), seed on first launch, "delete all data".
      TODO: real SQLite tables + migrations, encryption, Zod validation on read, JSON/CSV export.
- [~] **S22 Vaccines & medications** — log (name, date, free-text dose, note) + optional next date with a local 09:00
      reminder. No schedules or doses from the app. Included in PDF reports.
- [~] **S23 Growth** — weight/length/head log, latest tiles, per-metric chart. No percentiles/norms (risk decision
      2026-11-14). Included in PDF reports (latest 12).

## Local-first (decided 2026-11-14)
- [x] **S24 Remove backend code** — auth (`@minik/auth`, Keycloak, login theme), HTTP client, sync engine/outbox, DTOs removed.
      Data stays on the device only. Revisit with S17 if multi-device or partner sharing is needed (iCloud/CloudKit or own API).
- [x] **S25 Onboarding** — welcome + language, parent (name, role), first baby, look (theme + palette). No demo data on first launch.
- [x] **S26 Color palettes** — mint/rose/sky/lavender/peach for light and dark (night stays dim), softer cards, greeting on Today.

- [x] **S27 Limits, size, polish** — max 5 babies, birth date ≤6 y, lab/solid caps; removed expo-image/expo-device/zod;
      Android R8 + shrinkResources; cached Intl formatters; elevation tokens, HeroCard on Today, richer StatTile/EmptyState.
      Measured: 1 baby × 150 days ≈ 3.75k events ≈ 0.9 MB JSON, ~2 ms (Node) per full-table write. 5 babies or ~2 years
      ≈ 4.5 MB → move to real SQLite rows (S21) before that becomes a per-tap cost.
## Backend integration (on hold: local-first)
- [x] **S28 Store readiness + polish** — no reference ranges (neutral lab badges), consent + legal screens, store config,
      icon set, `docs/APP_STORE.md`; Today: one-row quick log, 3-up summary, face avatar; slimmer charts; 5-across palette.
- [ ] **S17 Sync** — removed in S24; previous implementation backed up outside the repo. Options: CloudKit (iOS only) or own API.
- [ ] **S18 Multi-caregiver, push-to-start Live Activities** — needs sync.

## Later
Pumping, widgets, biometric lock, CSV/JSON export, doctor-share link (needs backend).
