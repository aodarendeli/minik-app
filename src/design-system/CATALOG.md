# Design-system catalog

Read before any UI work. Import everything from `@/design-system`. One line per item: `Name — key props — when to use`.
Features never pass styles, hex or numbers: only token keys (`gap="md"`, `bg="surface"`, `tone="feeding"`).

## Tokens & theme
Tokens live in `@minik/design-tokens` (shared with the Keycloak login theme). Re-exported types: `ColorToken`, `Tone`, …
- `ThemeProvider` — `preference: 'system'|'light'|'dark'|'night'` — once at the root (composition/providers.tsx).
- `useTheme()` — returns `Theme` (colors, space, radius, size, typography…) — only inside DS or nav theming in `src/app`.
- `Tone` — `brand|neutral|feeding|diaper|sleep|health|success|warning|danger|info` — maps to solid/onSolid/soft/onSoft colors.

## Primitives
- `Box` — direction, gap, padding(X/Y/Top/Bottom), bg, radius, borderColor, align, justify, wrap, flex, shrink — raw layout.
- `Stack` / `Inline` — Box as column / centered row — default layout tools.
- `Spacer` — flexible gap in a row/column.
- `Text` — `variant` (display|title1|title2|body|bodyStrong|label|caption|timer|timerSm), `color`, `align`, `capScale` — all text.
- `Icon` — `name` (registry in primitives/icons.ts), `size`, `color` — SF Symbols on iOS, Material Symbols on Android/web.
- `Pressable` — a11y label required, padding, radius, bg — custom tappable areas (min 48dp).
- `Divider` — `label?` — hairline separator between rows; with label renders "── veya ──".

## Components
- `Button` — label, onPress, variant(solid|soft|outline|ghost), tone, size, icon, loading, fullWidth — every text action.
- `BrandMark` — Minik face on a brand halo (onboarding hero). Decorative.
- `Checkbox` — **label**, checked, onChange, error — consent and opt-ins; whole row is the target.
- `HeroCard` (pattern) — title, subtitle, media, children, tone, onPress — colorful top card with decorative circles (Today).
- `IconBubble` — icon, tone, size md|lg — decorative icon in a soft round halo (onboarding heroes, feature lists).
- `ProgressDots` — current, total, **label** — step indicator (announced as a progress bar).
- `IconButton` — icon, **label**, onPress, tone, variant — icon-only actions (label is read by screen readers).
- `ActionTile` — icon, label, caption, tone, active — big quick-log tiles (Today, diaper types).
- `Card` — tone (soft tint), padding, gap, onPress+accessibilityLabel — grouped content.
- `Chip` / `ChipGroup` — label, selected, tone, icon — filters, presets, single/multi choice (shows check, not color only).
- `SegmentedControl` — options, value, onChange, accessibilityLabel — 2–4 mutually exclusive options.
- `TextField` — label, value, onChangeText, helper, error, suffix, keyboard(default|number|decimal), multiline — text input.
- `NumberStepper` — label, value, onChange, step/min/max, unit, +/- labels — bounded numbers (bottle ml).
- `DateField` — label, value `YYYY-MM-DD`, onChange, max, formatValue — date entry (type DD.MM.YYYY or step by day).
- `ListItem` — title, subtitle, meta, icon+tone, trailing, onPress, showChevron — rows in lists.
- `SectionHeader` — title, action{label,onPress} — section titles.
- `EmptyState` — icon, title, body, tone, action — no data yet.
- `Avatar` — name (initials), tone, size — baby identity.
- `Badge` — label, tone — small status (e.g. lab range position).
- `StatTile` / `StatGrid` — label, value, caption, icon, tone — numeric summaries.
- `TimerDisplay` / `formatDuration` — elapsedMs, size — running timers (tabular digits).
- `BarChart` — data{key,label,value,valueLabel}, tone, accessibilityLabel — small trends (no chart dependency).
- `PalettePicker` — value, onChange, **labelFor** — accent palette swatches (ring + check when selected).
- `Notice` — text, tone, icon — inline info / medical disclaimer.
- `SnackbarProvider` / `useSnackbar().show({message, action})` — transient feedback, undo (5 s).
- `confirmAsync({title,message,confirmLabel,cancelLabel,destructive})` — destructive confirmations.

## Patterns
- `ScreenContainer` — title, subtitle, headerAccessory, footer, scroll — every screen (safe area, keyboard, max width).
- `PeriodNavigator` — label, caption, onPrevious/onNext, canGoNext — day/week stepping.

## Headless hooks
- `usePressableA11y` — role/label/state props for anything pressable.
- `useControllableState` — controlled + uncontrolled value.
- `useStepper` / `clampStep` — bounded increment logic.
