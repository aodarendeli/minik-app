# PERFORMANCE AND SIZE

Goal: small download/install size and fast startup. Size is a feature: every dependency, asset and native module must earn its place.
Three different sizes, tracked separately: **JS bundle** (Hermes bytecode), **Android download** (AAB -> per-device APK), **iOS download** (App Thinning).

## Biggest levers (in order)
1. **Fewer native modules.** Native code (C++/Kotlin/Swift) usually outweighs JS. Each native dependency needs a justification and a measured delta.
   Heavy suspects: Skia/chart engines, Lottie, Firebase/analytics SDKs, camera/maps/ML, extra notification libs.
   Already accepted native weight: Reanimated, Unistyles, MMKV, react-native-svg, notifications, Live Activity extension (iOS).
   VERIFY S10: if `react-native-notify-kit` can also schedule the reminders, use ONE notification library instead of two.
2. **Android App Bundle only.** Ship `.aab`; Play serves per-ABI/density/language splits. Never distribute a universal APK to users.
3. **Android shrinking.** Enable R8 minify + resource shrinking in release (via `expo-build-properties` or a small config plugin; verify
   property names for the SDK in use). Restrict locales to `tr`/`en`. Test release builds after enabling (R8 can strip reflection-only code).
   If images are only rendered through `expo-image`, the WebP toggle in Expo's app-size guide can be disabled to save size.
4. **Lean JS.**
   - Don't rely on tree shaking: Expo's Metro tree shaking is documented as experimental (opt-in via `EXPO_UNSTABLE_TREE_SHAKING=1`; sources
     disagree on defaults). Write code that is small without it; treat enabling it as a measured experiment, not a given.
   - Import by subpath: `date-fns/format`, `date-fns/locale/tr` (only needed locales). No `lodash`, `moment`, `axios` (use `fetch`).
   - **Icons:** do NOT import from an icon library barrel (bundles every icon without tree shaking). `Icon` uses a typed registry of
     ~30 icons as inline SVG path data (ISC/MIT-licensed sources, e.g. Lucide) rendered with `react-native-svg`. Add icons one at a time.
   - Validation: Zod is fine; if Atlas shows it large, evaluate `zod/mini` or Valibot (record in DECISIONS.md).
   - Charts: custom `react-native-svg` bars/lines for MVP. Avoid Skia-based chart stacks unless justified by a measured trade-off.
5. **Assets.** Prefer vector/SVG and code-drawn UI. Raster images as WebP/AVIF, sized for their max display, no bundled stock art.
   Fonts: system font by default (zero bytes). If a brand font is chosen: one family, <=2 weights (or one variable font), subset to tr/en glyphs.
   No Lottie/video in MVP. Tips content is JSON/text, loaded per locale.
6. **Dev-only code out of production.** Gallery/seed screens are gated by `__DEV__`; verify with Atlas that they are absent from the production bundle.
7. **Lazy work, not lazy bundles (for now).** Defer heavy init (notification setup, fixtures) until after first render. Evaluate async routes /
   `inlineRequires` as a measured optimization (VERIFY), since Hermes already memory-maps bytecode.

## Measure (S00 baseline, then every PR that touches deps/assets/native config)
| What | How |
|---|---|
| JS bundle composition | `EXPO_ATLAS=true npx expo export --platform android`, then `npx expo-atlas .expo/atlas.jsonl` (or `EXPO_ATLAS=true npx expo start --no-dev`) |
| JS bundle size | size of the exported Hermes bundle (`dist/_expo/static/js/**`); script `npm run size` prints it |
| Android download/install | EAS production `.aab` -> `bundletool get-size total` for a reference device spec, or Play Console / Android Studio APK Analyzer |
| iOS download/install | App Thinning Size Report (Xcode archive / EAS build) |
| Native delta of a new dep | build before/after on the same profile, compare AAB size; note it in DECISIONS.md |
Keep a **baseline log** below (one line per measurement: date, commit, JS KB, AAB MB, iOS MB, note).

## Budget policy
- Targets are set after the S00 baseline (do not guess numbers): record `size-budget.json` = baseline + tolerance.
- CI (`npm run size`): fail if the JS bundle grows >3% or >30 KB vs `size-budget.json` without an explicit budget bump in the PR
  (with reason). Native/AAB size is checked on release builds (manually or on a nightly EAS job), not on every PR.
- Dependency register (DECISIONS.md) must include **JS size (gz/min) and native impact** for every added dependency.
- Prefer deleting code over optimizing it. Unused exports, screens and fixtures in production paths are bugs.

## Startup and runtime performance (cheap wins)
FlashList for long lists; avoid re-render storms (view-model returns stable data; React Compiler if enabled); animate with Reanimated on the UI
thread; timers render at 1 Hz; avoid synchronous heavy work (JSON parse of big history) at launch; keep splash->first interactive screen minimal.
Profile before optimizing (React DevTools profiler, Hermes sampling) and record results in the baseline log.

## Baseline log
| Date | Commit | JS KB | Android AAB MB | iOS MB | Note |
|---|---|---|---|---|---|
| (S00) | | | | | fresh template, before app code |
