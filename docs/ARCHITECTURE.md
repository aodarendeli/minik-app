# ARCHITECTURE

Clean Architecture with vertical feature slices. Goal: a small in-repo "framework" so features are assembled, not hand-built.

## Folder structure
```
src/
  app/                     Expo Router routes ONLY (every file here is a route): thin files rendering <XScreen/>
    _layout.tsx            root Stack (modals for log/lab/baby forms) + <AppProviders>
    (tabs)/                NativeTabs: index (Today) | timeline | health | reports | settings
  composition/             container.ts (wires ports -> adapters, no React), providers.tsx (deps contexts, theme, i18n, query),
                           SessionPresenceBridge.tsx
  packages/<name>/         extractable libraries (future npm/framework). Own package.json (peers), README, tests.
                           - `design-tokens` (`@minik/design-tokens`): colors (light/dark/night), palettes, scales, tones, CSS vars
  core/                    cross-cutting, framework-free
    result.ts errors.ts clock.ts ids.ts logger.ts config.ts
    storage/               KeyValueStorage port, memory + MMKV adapters
    query/                 QueryClient setup, query-key helpers
    i18n/                  i18next init, typed keys, locales/{tr,en}/*.json
  design-system/           tokens, theme, headless, primitives, components, patterns, CATALOG.md
  platform/                native adapters implementing ports (notifications, live activity, haptics, permissions)
  features/<feature>/
    domain/                entities, value objects, ports (repository interfaces), use-cases  [pure TS]
    data/                  repository impls (memory, http), dto, mappers (zod), fixtures
    presentation/          screens, view-model hooks, feature components (composed from DS only)
    index.ts               public API of the feature
  shared/                  tiny cross-feature utils (date formatting, units) — no business rules
  test/                    builders, fakes, jest setup
```
Features (current): `babies`, `tracking` (feeding/diaper/sleep events, timers, Today, Timeline), `health` (lab tests:
blood, urine, screening… + value history), `reports` (daily/weekly summary + PDF export), `settings` (preferences,
parent profile, palette, onboarding gate + `OnboardingScreen`).
Later: `reminders`, `tips`, `growth`.
Each feature exposes two public entry points: `features/<f>/index.ts` (screens, hooks, deps context) and
`features/<f>/domain/index.ts` (pure types/functions for other features' domain/data). `reports` is an aggregating feature:
its domain may call other features' **pure** domain functions (e.g. `summarize`) through their `domain/index.ts`.

## Dependency rules (enforce with eslint-plugin-boundaries or dependency-cruiser)
| Layer | May import |
|---|---|
| `domain` | `core` (types only), own feature domain, other features' domain **types** via their index |
| `data` | own domain, `core` |
| `presentation` | own domain, `design-system`, `core`, `shared`, other features' public `index.ts` |
| `design-system` | `core` (theme/i18n helpers) only. Never features or domain |
| `platform` | `core`, domain **ports** |
| `app` (routes) | features' public `index.ts`, `design-system`, `core` |
| `composition` | everything (wires repositories/adapters into use-cases) |
| `packages/*` | only their peer dependencies + relative files. **Never** `@/…` (lint-enforced) |
| everyone else | packages only via the public entry (`@minik/design-tokens`) |
Presentation never imports `data` or `platform` directly: it receives use-cases through its feature's deps context
(`createDepsContext` in `core/di.tsx`, e.g. `TrackingDeps.useDeps()`), provided once in `composition/providers.tsx`.

## Data flow
```
Screen -> useXViewModel() -> UseCase (domain) -> Repository port <- Memory | MMKV | Http impl (data)
                 |                                  ^ chosen in app/composition/container.ts
        TanStack Query (cache/invalidations)
```
- **Use-cases** are plain functions/classes taking ports; return `Result<T, AppError>`; no framework imports.
- **Repositories** return `Promise<T>` and may throw `RepositoryError`; use-cases convert to `Result`.
- **View-model hooks** are the only place screens touch data/state. They return plain data + handlers.
  Screens render; they contain no business logic and no data fetching.
- **TanStack Query** owns async data; **Zustand** only for ephemeral UI state and the active-session mirror.
  Never duplicate server/data state into Zustand.
- **Local-first (2026-11-14):** no backend. Screens read local tables (`core/storage/table.ts`, keys `minik.v1.*`);
  one container + QueryClient for the app. First launch shows onboarding until `settings.onboarded` is true (route gate
  in `app/_layout.tsx`). A future sync would plug in behind the repository ports; domain and use-cases stay unchanged.
  Fixtures are deterministic (seeded) and used by tests, dev seed screen and demos.

## Composition root and headless context
`createContainer({ clock, ids, seedDemoData })` (`src/composition/container.ts`) builds use-cases from ports. It must run
**without React** (notification action handlers run in a headless JS task). Tests inject `fixedClock` + `sequentialIds`.
Later: `registerPresenceHandlers(container)` (platform exposes the function; composition calls it — no upward import).

## Errors
`AppError = { code: ErrorCode; message?: string; cause?: unknown }` with a closed `ErrorCode` union
(`NotFound`, `Validation`, `Conflict`, `Storage`, `Network`, `Permission`, `Unknown`).
UI maps codes to i18n keys (`errors.<code>`). Error boundary at the root and per tab. Never show raw messages.

## Validation
Zod schemas live in `data/` (storage and DTO boundaries). Parse on read; drop/repair corrupt records and log a
non-PII warning. Domain trusts its inputs.

## Navigation
Expo Router. Route files: `export default function Route() { return <FeedingTimerScreen /> }` — nothing else.
Params parsed with Zod in the screen's view-model. Typed routes enabled.

## State and time
- Time: inject `Clock { now(): Instant }`. Instants are epoch ms (UTC); display via `shared/format` with locale and
  device time zone. Store UTC only. Test DST and time-zone change.
- IDs: client-generated UUIDs (`expo-crypto`), enabling offline creation and idempotent sync.

## i18n
In-house, dependency-free (`core/i18n`): `locales/tr.ts` is the source of truth, `en.ts` must match its shape (typecheck +
parity test). `useI18n()` returns `{ t, locale, intlTag }`; `t('today.title')` keys are typed. Typed keys, `tr` default. No string concatenation for sentences; use interpolation and
plural rules. Dates/numbers via `Intl` / date-fns locales.

## Conventions
- TS strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` where practical. Alias `@/` -> `src/`.
- Named exports only (route files excepted). Barrels (`index.ts`) only at feature and design-system roots.
- File names: `kebab-case.ts`, components `PascalCase.tsx`. One component per file. Component <=150 lines,
  function <=40 lines, file <=300 lines — split otherwise.
- Prefer composition over props explosion; boolean props that change layout => variants.
- React Compiler: enable if supported by the chosen Expo SDK template (verify). Then avoid manual
  `useMemo`/`useCallback` unless profiling shows a need.
- Lists: FlashList for any list that can exceed ~30 rows. Stable keys. No inline lambdas for heavy rows.
- Logging via `core/logger`; never log baby names, notes or timestamps tied to identity.

## ESLint guardrails (`eslint.config.js`, active)
Implemented now: RN UI primitives + `style` objects banned in `src/app` and feature presentation; presentation cannot import
`data/` or `@/platform`; domain cannot import react/react-native/expo/DS; `Date.now()`/`new Date()` banned in domain and
presentation; lodash/moment/axios banned. Still TODO: eslint-plugin-boundaries for cross-feature internals.
Original list:
- `eslint-plugin-boundaries` (or dependency-cruiser) for the table above.
- In `src/features/**` and `src/app/**`: `no-restricted-imports` for `StyleSheet, View, Text, Pressable, TextInput,
  Image, ScrollView, FlatList, Modal` from `react-native`; `no-restricted-syntax` for JSX `style=` props and
  `react-native/no-color-literals`, `react-native/no-inline-styles`.
- In `src/features/*/domain/**`: forbid imports of `react`, `react-native`, `expo-*`.
- `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `consistent-type-imports`, `import/no-default-export`.
- Size guardrails via `no-restricted-imports`: ban `lodash*`, `moment`, `axios`, root `date-fns` (use `date-fns/<fn>` subpaths and only `tr`/`en` locales),
  and icon-library barrels outside `design-system/icons`.
- `no-restricted-globals`/syntax: `Date.now`, `new Date()` outside `core/clock.ts` and `shared/format`.

## Feature template (copy for new features)
```
features/<name>/
  domain/{entities.ts, ports.ts, use-cases.ts, index.ts, *.test.ts}
  data/{<name>.memory-repository.ts, fixtures.ts, (later) <name>.dto.ts, <name>.mapper.ts}
  presentation/{deps.ts, <Name>Screen.tsx, use-<name>-view-model.ts, components/*}
  index.ts
```
Checklist for a new feature: deps context in `presentation/deps.ts` → provide it in `composition/providers.tsx` → wire repos in
`composition/container.ts` → thin route in `src/app` → strings in `tr.ts` + `en.ts` → query keys under a `queryKeys` prefix.
