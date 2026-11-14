# DESIGN SYSTEM

Framework-like, token-driven, headless-first. Screens are assembled from components; they never style.
Reuse before create: check `src/design-system/CATALOG.md` (one line per component/hook) before adding anything.

## 1. Principles
1. **Single source of truth:** every color, space, radius, size, type style, shadow, duration comes from tokens.
2. **Headless-first:** behavior + accessibility live in hooks (no styles). Skins consume the hook and the theme.
3. **Compose, don't customize:** variants and slots, not ad-hoc props. Need something new? extend the DS.
4. **Accessible by default:** role/label/state, >=48dp targets, Dynamic Type, reduce motion, contrast-tested.
5. **Night-aware:** light, dark and a dim "night" theme. No pure white in night. Low-glare accents.

## 2. Token architecture (3 tiers)
```
primitive  (raw scales: palette.teal[500], space values)         (inlined in the semantic files for now)
semantic   (meaning: canvas, textPrimary, brand…)                  src/packages/design-tokens/*  (@minik/design-tokens) <- shared
                                                                   with keycloak-theme/ via cssVariables()
component  (per-component: button.height.md)                      design-system/components/<X>/tokens.ts (optional)
```
Themes (`light`, `dark`, `night`) differ only in the semantic mapping. Components never reference primitives.

### Token specs (starting values; developer may tune, tests must keep passing)
```ts
space:   { none:0, xxs:2, xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, xxxl:48, huge:64 }   // 4pt grid
radius:  { none:0, xs:4, sm:8, md:12, lg:16, xl:24, pill:999 }
size:    { touchTarget:48, control:{sm:40, md:48, lg:56}, icon:{sm:16, md:20, lg:24, xl:32}, avatar:{sm:32, md:48, lg:72} }
type:    display 32/40 700 | title1 24/32 700 | title2 20/28 600 | body 16/24 400 | bodyStrong 16/24 600
         label 14/20 600 | caption 12/16 400 | timer 56/64 700 tabular-nums | timerSm 28/36 700 tabular-nums
         // font families via tokens (regular/medium/bold); maxFontSizeMultiplier 1.3 for fixed-height controls
elevation: { 0, 1, 2, 3 }  // platform-specific shadow/elevation objects hidden behind the token
opacity: { disabled:.4, pressed:.85, scrim:.5 }
motion:  duration { instant:80, fast:150, base:250, slow:400 }, easing { standard, decelerate, accelerate }
         // when reduce-motion is on all durations resolve to 0 and springs become timing
zIndex:  { base:0, sticky:10, overlay:100, modal:200, toast:300 }
breakpoints: compact 0 | medium 600 | expanded 840      // window-size classes
```
### Semantic colors (names are the contract; hex values per theme)
```
background: canvas, surface, surfaceRaised, surfaceSunken
content:    primary, secondary, tertiary, disabled, inverse
border:     subtle, default, strong, focus
brand:      primary, onPrimary, primarySoft, onPrimarySoft
feedback:   success|warning|danger|info  (+ Soft, + on*)
care:       feeding, diaper, sleep, growth  (+ Soft, + on*)   // category identity colors
overlay:    scrim
```
Direction: calm and warm. Starting hues: brand teal/blue-green, feeding coral, diaper amber, sleep periwinkle,
growth green. Night theme: lower luminance, warmer, max text luminance below pure white.
**Contrast test (required in S01):** every `on*`/`content.*` vs its background pair >=4.5:1 (text) and >=3:1
(icons/large text) in all three themes. Fails => tokens are wrong, not the test.

## 3. Theming mechanics
**Current (2026-11):** in-house `ThemeProvider` (React context) + RN `StyleSheet`/style objects **inside design-system only**.
Tokens are plain TS (`tokens/colors.ts`, `tokens/scales.ts`, `tokens/tones.ts`), so a later move to Unistyles touches only
`theme/` and primitives. Reason: works in Expo Go and dev builds, zero native deps, fully typed token props. See DECISIONS.md.

Original plan (kept for reference, revisit if styling perf becomes an issue):
- `StyleSheet.configure({ themes: { light, dark, night }, breakpoints, settings })` once in `design-system/theme/unistyles.ts`,
  imported first in the app entry. Type the themes via module augmentation (`UnistylesThemes`, `UnistylesBreakpoints`).
- Styles: `StyleSheet.create(theme => ({ ... }))` imported from `react-native-unistyles` **only inside design-system**.
- Variants through the library's variants API. Reanimated access via its reanimated helpers.
- Requires a dev build (no Expo Go). Fallback if blocked: NativeWind v4 or Restyle — keep the token files framework-agnostic
  (plain TS objects) so only `theme/` and primitives change.
- User theme preference (system/light/dark/night, optional auto-night 22:00–06:00) lives in settings and drives the theme.

## 4. Layers
```
tokens -> headless hooks -> primitives -> components -> patterns -> screens
```
- **Primitives:** `Box`, `Stack` (column), `Inline` (row/wrap), `Text`, `Icon`, `Pressable`, `Surface`, `Divider`, `Spacer`, `SafeArea`.
  Layout props are **token keys only**: `<Stack gap="md" padding="lg" bg="surface" radius="lg">`. No numbers, no hex.
  The raw `style` escape hatch exists only inside design-system.
- **Components:** Button, IconButton, Card, Chip, SegmentedControl, Switch, TextField, NumberStepper, QuickAmountChips,
  Sheet, Dialog, Snackbar (undo action), ListItem, SectionHeader, EmptyState, Skeleton, Avatar, Badge, ProgressRing,
  TimerDisplay, DateTimeField, Tabs styling, Header.
- **Patterns:** domain-agnostic compositions: `ScreenContainer` (safe area, scroll, header, keyboard), `FormField`,
  `TimelineRow`, `StatTile`, `ConfirmDialog`. Domain-specific compositions live in the feature's `presentation/components`
  and are still built only from DS parts.

## 5. Headless pattern (the core idea)
Each interactive component = **hook** (state, handlers, a11y props, no styles) + **skin** (tokens + variants).
Hooks (in `design-system/headless/`): `useControllableState`, `usePressableButton`, `useToggle`, `useDisclosure`,
`useStepper`, `useSegmentedControl`, `useTextFieldState`, `useSnackbarQueue`, `useReducedMotion`, `useFocusRing`.
Rules: hooks return prop-getters (`getRootProps()`) and state; support controlled + uncontrolled; fully unit-tested
with `renderHook`; no imports from skins. Complex widgets (dialog, select, tabs, toast) may adopt `@rn-primitives/*`
or `react-native-aria` **only after** the dependency check in DECISIONS.md; otherwise implement our own hook.

Illustrative (verify variant API in docs):
```tsx
export function Button({ label, onPress, variant = 'solid', tone = 'primary', size = 'md', loading, disabled, testID }: ButtonProps) {
  const { rootProps, state } = usePressableButton({ onPress, disabled: disabled || loading, accessibilityLabel: label });
  styles.useVariants({ variant, tone, size, pressed: state.pressed, disabled: state.disabled });
  return (
    <Pressable {...rootProps} testID={testID} style={styles.root}>
      {loading ? <Spinner /> : <Text variant="label" style={styles.label}>{label}</Text>}
    </Pressable>
  );
}
```

## 6. Component definition of done
- [ ] Headless hook + skin + typed props (`variant`, `tone`, `size` as unions; `testID` passthrough; ref as prop)
- [ ] Only semantic tokens; zero literals; start/end (RTL-safe)
- [ ] States: default, pressed, focused, disabled, loading, error (as relevant)
- [ ] a11y: role, label, state, hint; target >=48dp; announces changes; works with font scale 130% and screen reader
- [ ] Reduce-motion respected; haptics via `useHaptics` on meaningful actions only
- [ ] Renders correctly in light/dark/night (gallery)
- [ ] Unit tests (hook behavior + one RNTL test of the skin); CATALOG.md line added; gallery entry added

## 7. Gallery and catalog
- Dev-only route `src/app/(dev)/gallery` renders every component in every variant/size/state with a theme switcher and
  font-scale toggle. No Storybook dependency. Gated by `__DEV__`; verify with Atlas that it is absent from the production bundle.
- `CATALOG.md`: `Name — props summary — when to use`. Agents read it before creating UI.

## 8. Icons, motion, haptics
- `<Icon name="..." />` backed by a typed registry (`primitives/icons.ts`) mapping each name to an SF Symbol (iOS) and a
  Material Symbol (Android/web) rendered by `expo-symbols` (already in the template; zero extra bytes, no react-native-svg).
  Names are type-checked against both symbol sets. Never import icons in features; add one icon at a time.
- Fonts: system font by default. A brand font = one family, <=2 weights (or one variable font), subset to tr/en.
- Motion: Reanimated; durations/easings from tokens; timer visuals update at <=1 Hz except ring animation.
- Haptics: `useHaptics()` wrapper (light on tap-start, success on save, warning on destructive). User can disable.

## 9. Anti-patterns (reject in review)
Inline `style`, hex/number literals in features, copy-pasted button variants, `Platform.OS` styling in features,
prop-drilling colors, one-off modals, text without `Text` variants, fixed heights that break at 130% font scale,
icon-only buttons without labels, color as the only state indicator.
