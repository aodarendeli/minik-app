# Minik — baby feeding & care tracker (React Native)

Working name. Mobile app for parents ("my baby" companion): breast/bottle/solid feeding timers, diaper, sleep,
lab tests (blood/urine/…), daily/weekly PDF reports; later growth, vaccines, reminders, tips.
Local-first, no backend (decided 2026-11-14): data is stored only on-device (expo-sqlite kv-store, `core/storage/table.ts`)
behind repository interfaces. First launch runs onboarding (parent, baby, look); no demo data is seeded.

## Prime directives
1. Smallest correct diff. One slice at a time (docs/ROADMAP.md). No scope creep, no drive-by refactors.
2. Follow the docs; do not re-derive decisions. Read a doc only when the task touches it (index below).
3. Features never style. All visuals come from design-system tokens, layout primitives and components.
4. `domain/` is pure TypeScript: no react / react-native / expo imports.
5. Every user-visible string goes through i18n (tr default, en). No hardcoded copy.
6. Verify before claiming done: `yarn run check` (typecheck + lint + jest). Report in <=5 lines.

## Stack (rationale and items to verify: docs/DECISIONS.md)
Expo SDK 58 (New Architecture), TypeScript strict, Expo Router (thin routes, NativeTabs), yarn.
Current: in-house ThemeProvider + tokens, expo-symbols icons, TanStack Query (data via use-cases), in-house typed i18n
(tr/en), Intl formatting, expo-print + expo-sharing (PDF), expo-sqlite kv-store (storage), expo-notifications (timer
presence, Expo Go phase), Jest (jest-expo) + RNTL.
Planned: real SQLite tables + encryption (S21), chronometer notification / Live Activity (S10 dev build), Zod, FlashList, Maestro.

## Layout
src/app (routes only) | src/composition (container + providers) | src/core | src/design-system | src/platform |
src/features/<f>/{domain,data,presentation} (babies, tracking, health, reports, settings) | src/shared | src/test |
src/packages/<name> — extractable libraries (future npm): design-tokens.
Colors/spacing/palettes change ONLY in @minik/design-tokens. Write them app-agnostic: no `@/` imports, own README + tests,
public API only via index.ts. Reusable hooks/components with no app knowledge belong here, not in features.
Dependency rule: presentation -> domain <- data. Features never import another feature's internals (only its index.ts).
design-system imports nothing from features. Details: docs/ARCHITECTURE.md.

## Commands
yarn run check         # typecheck + lint + tests; run once at the end of a slice
yarn typecheck | lint | test | test:changed
npx expo start         # currently works in Expo Go (only Expo Go-bundled modules so far)
npx expo run:android | run:ios   # dev build; required once MMKV/notifications/Live Activity land
(`yarn size` / size-budget.json: not created yet — S00 TODO)

## Docs index (read on demand)
- docs/PRODUCT.md — scope, personas, scenarios, copy rules (analyst)
- docs/ARCHITECTURE.md — layers, DI, state, errors, conventions (before creating files)
- docs/DESIGN_SYSTEM.md + src/design-system/CATALOG.md — before ANY UI work; reuse before create (import from `@/design-system`)
- docs/DOMAIN.md — entities, use cases, repository ports
- docs/TIMER_AND_PRESENCE.md — timers, ongoing notification, live activity, reminders
- docs/TESTING.md — what to test where
- docs/API_CONTRACT.md — future ASP.NET contract; keep DTOs/mappers aligned
- docs/PRIVACY_SECURITY.md — before storage/analytics/permissions work
- docs/PERFORMANCE_AND_SIZE.md — size budget; read before adding any dependency, asset, font or native module
- docs/WORKFLOW.md — agent loop, report formats, token rules. docs/ROADMAP.md — slices and status
- docs/DECISIONS.md — dependency log; add a line before adding any dependency

## Agent workflow (main agent orchestrates)
Per slice: analyst -> developer -> tester -> (developer fixes, max 2 loops) -> human review.
Delegate with a one-paragraph brief + file paths; demand <=15-line reports. Subagents cannot spawn subagents.
Trivial edits (<3 files, no new behavior) may skip the analyst.

## Token discipline
- Grep/Glob first, then Read with line ranges. Never read lockfiles, generated files, node_modules, Pods, build output.
- No restating the task, no plans over 10 lines, no summaries of unchanged files.
- Prefer Edit over Write for existing files. Batch independent tool calls.
- Iterate with `test:changed` or a single path; full `check` once at the end.
- After each finished slice tell the human to run /clear.

## Hard rules (lint-enforced where possible)
- No inline styles, color or number literals in features. No `StyleSheet`/`View`/`Text`/`Pressable` imports in features: use DS primitives.
- No `any`, no non-null `!`, no default exports (except Expo Router route files), no `eslint-disable` to dodge a rule.
- Time only via injected `Clock`; never `Date.now()` in domain/features. Timers derive elapsed from timestamps, never from counters.
- Storage, notifications, PDF/share, native APIs only via ports (domain/core) + adapters (platform/data).
- Lab values: never ship or suggest reference ranges; compare only to the range the user entered, neutral colors (PRODUCT.md).
- New dependency => one line in docs/DECISIONS.md first (name, why, license, last release, New-Architecture support).
- Accessibility: role/label/state, >=48dp targets, Dynamic Type and reduce-motion safe, RTL-safe (start/end, not left/right).
- No medical advice or diagnosis in copy. Use the wording rules in docs/PRODUCT.md.
- Keep the app small: no whole-library or barrel imports (date-fns by subpath, icons via our registry), no lodash/moment/axios,
  no images/fonts/Lottie without a size note. Run `npm run size` when deps, assets or native config change.
