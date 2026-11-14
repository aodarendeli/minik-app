# DECISIONS

Lightweight ADR log + dependency register. **VERIFY** = decided direction, but check current docs/health in the named slice
before locking in. (Research snapshot: November 2026. Library facts below came from web sources and were not
hands-on tested.)

## Decision log (newest first)
| Date | Decision | Why | Revisit when |
|---|---|---|---|
| 2026-11-14 | PDF report gains **growth** (latest 12 up to report end) and **vaccines & meds** sections. Notification tap no longer stacks a second timer (checks current route). Android notification small icon `notification-icon.png` (white face, 96 px, ~2 KB) + brand color via expo-notifications plugin; iOS uses the app icon. Name limits 24 chars (baby, parent), greeting uses first name, titles/chips truncate | Owner feedback | Expo Go always shows its own icon; verify in a dev/production build |
| 2026-11-14 | **Growth + vaccine/med log** in the Health tab (segments), generic `LocalRecordRepository`, `ReminderPort` (expo-notifications DATE trigger, web no-op); reminders never block saving. **Native tab bar**: outline→filled SF icons, iOS 26 minimize on scroll, chrome blur. **Charts**: capsule gradient bars, latest value bubble, dashed average | Owner picked growth + meds; logbook only, no percentiles/schedules | Owner wants report sections for them |
| 2026-11-14 | **Store readiness**: in-app Terms/Privacy/Medical notice with versioned consent (`LEGAL_VERSION`) in onboarding; app name Minik, bundle id `com.aodarendeli.minik` (final, never change), iOS privacy manifest, no non-exempt encryption, iPhone only, Android permissions emptied; `eas.json`; hostable `docs/legal/index.html`; checklist `docs/APP_STORE.md` | App Store / Play requirements; liability | Bundle id + support email chosen by owner |
| 2026-11-14 | **Assets**: new icon set (iOS 1024 PNG, Android adaptive fg/bg/mono, splash, favicon) drawn as SVG and rendered with headless Chrome; in-app `brand-mark.png` 240 px ≈ 6 KB (BrandMark, Avatar `face`) | Replace template art; tiny in-bundle cost | Professional illustration |
| 2026-11-14 | **Reverted same day** → app ships no reference ranges again; lab-range badges use neutral colors (no green/red) | Owner: avoid any medical-device / liability risk before App Store | — |
| 2026-11-14 | (reverted) **Lab templates prefill general reference ranges** (reverses "never ship ranges", owner request): age-banded, editable, flagged `refSource`, worded "general reference". Sources: North Bristol NHS Trust "Children's Reference Ranges for FBC" HA/WE/003 v4 (Hb, Hct, WBC, platelets 150–400); Pediatric Endocrine Society vitamin D sufficiency 20–100 ng/mL; WHO 2020 ferritin <12 µg/L (<5 y, from 6 mo, lower limit only). Not offered: bilirubin (hour-specific nomogram), serum iron and urinalysis (adult/variable ranges). Sarılık template gains transcutaneous bilirubin | Typing ranges was the main friction; cited ranges + clear labeling keep it honest | Clinical review of ranges; store release in regions where range flags count as a medical device; a pediatrician asks for different sources |
| 2026-11-14 | **Size pass**: removed unused `expo-image` (pulls SDWebImage on iOS), `expo-device`, `zod`; Android release builds use R8 minify + resource shrinking (`expo-build-properties`), cleartext HTTP off. JS bundle compression stays off (startup speed over a few hundred KB) | Smallest install size without behavior change | Release build crashes from R8 (add keep rules) |
| 2026-11-14 | **Product limits**: max 5 babies, birth date within 6 years, lab title ≤60 chars / ≤40 values, solids ≤10 items × 40 chars (`Limit` error code) | Keeps switcher/report layouts intact and storage bounded | Users ask for more |
| 2026-11-14 | **Local-first, no backend for now**: auth, Keycloak login theme, HTTP + sync removed; data only on device; onboarding asks parent + baby. Removed deps: `expo-auth-session`, `expo-secure-store`, `expo-web-browser`. Rows below about Keycloak/sync are historical | Comparable apps work without an account; less privacy/KVKK burden, no server cost; SSL pinning moot | Partner sharing or multi-device sync needed (CloudKit iOS-only vs own API for Android) |
| 2026-11-14 | **Accent palettes** in `@minik/design-tokens` (`palettes.ts`, `withPalette`): tint brand + backgrounds of light/dark; night theme keeps its own dim colors. Contrast test covers every palette | Warmer, personal look without new deps | — |
| 2026-11-11 | Auth: **Keycloak (OIDC, Authorization Code + PKCE, public client)**, user identity only; per-baby authorization lives in the API DB (`baby_caregivers`) | Owner already runs ASP.NET Core + PostgreSQL + Keycloak; self-hosted fits KVKK health data; standard native-app flow (RFC 8252) | — |
| 2026-11-12 | Login look: **Keycloakify theme `minik`** in `keycloak-theme/` (separate Vite project), assigned per client (`minik-mobile` only). Design tokens extracted to **`@minik/design-tokens`** and shared by the app and the theme (CSS variables) | Owner wants the hosted page to look like the app; one source of truth for colors | Keycloak major upgrade → rebuild jar |
| 2026-11-12 | Sign-out: **back-channel logout** (POST refresh token to Keycloak), no browser on iOS/Android | No browser flash; ends the server session so the leftover SSO cookie is useless | — |
| 2026-11-12 | Sign-in UI: **hosted Keycloak page in the system browser** (not WebView, not a native password form), themed later with Keycloakify; iOS `ephemeralSession` on | Security (RFC 8252/9700), Google/passkeys/password managers work, registration/reset/MFA come free | — |
| 2026-11-11 | ~~Dev reuses the web app's confidential client~~ → superseded same day: public client `minik-mobile` (no secret). Dev-only secret support kept in `@minik/auth` | | |
| 2026-11-11 | (superseded) Dev reuses the web app's **confidential** Keycloak client (`test`) with its secret from `.env.local`; secret read only under `__DEV__` (verified absent from the release bundle) | Owner preferred not to create a client yet | **Before any store/TestFlight build**: create a public client (PKCE) and remove the secret |
| 2026-11-11 | Reusable code lives in **`src/packages/<name>`** (first: `@minik/auth`), alias via tsconfig `paths`, own `package.json` with peers, no imports from the app (lint-enforced) | Owner plans to extract shared hooks/components into a framework/npm packages later | Move to a monorepo workspace when a second app consumes them |
| 2026-11-11 | Sign-in is **optional by configuration**: without `EXPO_PUBLIC_KEYCLOAK_*` the app runs local-only; with it, routes are protected (`Stack.Protected`) | Backend not live yet; keeps Expo Go demos working | Backend sync (S17) |
| 2026-11-10 | Storage (interim): **expo-sqlite kv-store**, one JSON document per table (`core/storage/table.ts`), keys `minik.v1.*` | Expo Go compatible, sync API keeps repositories simple; demo data seeded only on first launch | Thousands of events (rewrite cost) or encryption required -> real SQLite tables / SQLCipher (dev build) |
| 2026-11-10 | Timer presence (interim): **expo-notifications** sticky local notification, updated per state change, buttons open the app | Only option testable in Expo Go; no live counter (no chronometer API). Real presence = S10 adapters behind the same `SessionPresencePort` | Moving to a dev build |
| 2026-11-10 | Timer UX: instant start kept; quick discard (<10 s, no dialog), sessions <30 s not saved, "started N min ago" chips, start-side correction | Fast one-handed start without accidental/incorrect records | Usability feedback |
| 2026-11-10 | Package manager **yarn 1** (`yarn.lock`), not npm | Project was switched to yarn before bootstrap; `npx expo install` detects it | Team preference changes |
| 2026-11-10 | Styling: **in-house ThemeProvider + token props**, Unistyles deferred | Zero native deps, runs in Expo Go, typed tokens; tokens are plain TS so Unistyles can replace `theme/` later | Profiling shows theme-switch/re-render cost, or variants API needed |
| 2026-11-10 | Icons: **expo-symbols** registry (SF Symbols / Material Symbols) instead of react-native-svg + Lucide paths | Already in template, no extra native module, names type-checked | Need custom/brand icons |
| 2026-11-10 | i18n: **in-house typed `t()`** instead of i18next | ~60 lines, typed keys, tr/en parity test; no plural complexity needed yet | Need ICU plurals / more locales |
| 2026-11-10 | PDF: **expo-print (HTML -> PDF) + expo-sharing** | First-party, works in Expo Go, HTML/CSS gives tidy A4 tables; web falls back to print dialog | Need charts inside PDF (render SVG into HTML) or very large reports |
| 2026-11-10 | Charts in-app: view-based `BarChart` in DS | Small trends only; no chart dependency | Line charts / growth percentiles (S23) |
| 2026-11-10 | Dates: `Intl` + `core/time` helpers, no date-fns yet | Hermes Intl covers tr/en formatting | Complex date math / pickers |
| 2026-11-10 | Data: memory repositories + seeded demo fixtures | Matches roadmap (dummy until S21) | S21 Persistence |
| 2026-11-10 | ESLint pinned to **9.x** | ESLint 10 breaks eslint-plugin-react used by eslint-config-expo (`getFilename` removed) | eslint-config-expo supports 10 |
| 2026-11-10 | New feature slices: `health` (lab tests) and `reports` (PDF) | User priority: reporting + lab tracking | — |

## Platform
| Topic | Decision | Notes |
|---|---|---|
| Framework | Expo (latest stable SDK via `create-expo-app@latest`) + dev client | New Architecture is mandatory from React Native 0.82 / Expo SDK 55. Do not pin versions from this doc; accept the template's SDK and run `npx expo install --check`. VERIFY S00 |
| Expo Go | Not used | Native modules (notifications, live activity, MMKV, Unistyles) need dev builds / EAS |
| Language | TypeScript strict | |
| Package manager | yarn 1 (lockfile committed) | Switched from npm (see log) |
| Routing | Expo Router, typed routes | Routes stay thin |

## UI
| Topic | Decision | Alternatives | Notes |
|---|---|---|---|
| Styling/theme | ~~Unistyles 3~~ → in-house ThemeProvider for now (see log) | NativeWind v4 (popular default, className tokens in tailwind config), Uniwind, Restyle, Tamagui | Chosen because themes/variants are typed, compile to native StyleSheet-style objects and let components consume tokens without className strings in screens. Needs New Architecture (already mandatory) and a dev build. Keep tokens as plain TS so a swap only touches `theme/` + primitives. VERIFY S01 (API names, jest setup, React Compiler compat) |
| Headless | In-repo hooks; optional `@rn-primitives/*` / `react-native-aria` for dialog/select/tabs/toast | Gluestack, React Native Reusables | RN headless ecosystem is thinner than web. Adopt a package only if: license OK, recent releases, New-Architecture OK, issues healthy. Initial signal for rn-primitives was modest (small star count; last push seen Mar 2026) — VERIFY S02 |
| Icons | **expo-symbols registry (current)**. Original plan: own registry of ~30 inline-SVG icons (path data from Lucide, ISC) rendered by `react-native-svg` behind `<Icon/>` | lucide-react-native, Phosphor, @expo/vector-icons | Barrel imports of icon libraries bundle every icon when tree shaking is not relied on; icon fonts ship whole glyph sets. Use the library only if Atlas proves per-icon bundling. VERIFY S02 |
| Size policy | See PERFORMANCE_AND_SIZE.md: AAB only, R8 + resource shrinking, tr/en locales, system font, no tree-shaking reliance, `npm run size` budget in CI | | Expo tree shaking is documented as experimental; VERIFY S00 |
| Animation | Reanimated (+ worklets) | | |
| Lists | FlashList | FlatList | |
| Bottom sheet | Undecided | @gorhom/bottom-sheet vs own on Modal+Reanimated | Decide in S02 with maintenance check |
| Charts | View-based BarChart (DS) | victory-native, gifted-charts, custom SVG | Revisit for growth charts |
| PDF export | expo-print + expo-sharing | react-native-html-to-pdf, pdf-lib | Chosen: first-party, Expo Go compatible |

## State and data
| Topic | Decision | Notes |
|---|---|---|
| Async data | TanStack Query | caches use-case results; invalidate after mutations |
| Client state | Zustand | ephemeral UI + active-session mirror only |
| Validation | Zod | storage + DTO boundaries |
| Storage | MMKV (encrypted; key in SecureStore) behind `KeyValueStorage` | If history/stats outgrow KV or offline sync needs queries: `expo-sqlite` (+ Drizzle) behind the same repository ports. VERIFY S03 (MMKV v4/Nitro + Expo compat) |
| IDs | UUID via `expo-crypto` | client-generated |
| Dates | date-fns (+ locales) | no moment |
| i18n | In-house typed `t()` (current); i18next later if plurals/locales grow | tr default |

## Presence and notifications
| Topic | Decision | Notes |
|---|---|---|
| Android ongoing timer | `react-native-notify-kit` | Notifee was archived; notify-kit is a maintained drop-in fork (New Architecture only, Expo dev-build config plugin, v10.x seen). Chronometer notification needs no foreground service. VERIFY S10: action buttons in background handler, Android 14–16 behavior |
| iOS Live Activity | `expo-widgets` | First-party; stable since SDK 56 per Expo. Alternatives: `expo-live-activity` (early stage), Voltra. VERIFY S10 |
| Scheduled reminders | `expo-notifications` | local triggers; inexact scheduling by default |
| Foreground service | Not used | revisit only if background JS is truly required |
| Android Live Updates (Android 16 promoted ongoing notifications) | Evaluate after S10 | optional enhancement |

## Quality
| Topic | Decision |
|---|---|
| Lint/architecture | ESLint + eslint-plugin-boundaries (or dependency-cruiser) + restricted imports (see ARCHITECTURE.md) |
| Unit/component | Jest (jest-expo) + RNTL |
| E2E | Maestro |
| CI | GitHub Actions: typecheck, lint, test |
| Builds | EAS Build (iOS builds without a Mac; Live Activity needs Apple Developer account) |

## Dependency register (append; one line per dependency)
`name | purpose | license | last release | New Arch | JS size (min+gz) | native impact (none/small/large) | maintenance notes | added in slice`

- `expo-print ~58.0.8 | HTML -> PDF, print dialog | MIT | SDK 58 | yes | small | small (WebView/PDF APIs) | Expo first-party | S20`
- `expo-sharing ~58.0.22 | share sheet for the PDF | MIT | SDK 58 | yes | tiny | small; adds config plugin to app.json | Expo first-party | S20`
- `expo-crypto ~58.0.7 | randomUUID for client ids | MIT | SDK 58 | yes | tiny | small | Expo first-party | S03`
- `@tanstack/react-query ^5.107 | async data cache for use-cases | MIT | 2026 | n/a (JS) | ~13 KB gz | none | very active | S03`
- `expo-notifications ~58.1.8 | session presence + (later) reminders | MIT | SDK 58 | yes | small | medium; config plugin later for icons/colors | Expo first-party; push not in Expo Go (we use local only) | S10-interim`
- `expo-sqlite ~58.0.15 | kv-store persistence (later real tables) | MIT | SDK 58 | yes | small | medium (SQLite) | Expo first-party; config plugin added | S21-interim`
- `expo-build-properties ~58.0.12 | Android R8 minify + shrinkResources, no cleartext | MIT | SDK 58 | yes (config plugin only) | 0 runtime bytes | none (build-time) | Expo first-party | size pass`
- ~~`expo-auth-session ~58.0.18`~~ (removed 2026-11-14) | OIDC code flow + PKCE, token/refresh/revoke | MIT | SDK 58 | yes | small | small | Expo first-party; peer of @minik/auth | S17-auth`
- ~~`expo-secure-store ~58.0.3`~~ (removed 2026-11-14) | tokens in Keychain/Keystore | MIT | SDK 58 | yes | tiny | small; config plugin added | Expo first-party; peer of @minik/auth | S17-auth`
- ~~`zod ^4.6`~~ (removed 2026-11-14, unused; re-add when validating stored data in S21) `zod ^4.6 (imported as zod/mini) | runtime validation of API responses at the data boundary (ARCHITECTURE: Validation) | MIT | 2026-10 | n/a (JS) | ~3-5 KB gz via zod/mini (tree-shaken) | none | very active | S17-sync`
- dev: `eslint ^9`, `eslint-config-expo ~58`, `jest ~30`, `jest-expo ~58`, `@react-native/jest-preset`, `@testing-library/react-native 14`, `@types/jest` | lint/test only, not bundled | S00
- JS bundle (Android, Hermes, 2026-11-10, demo data included): 3.4 MB — baseline only, not yet compared to the template.
