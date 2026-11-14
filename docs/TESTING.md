# TESTING

Tests prove behavior from acceptance criteria. Keep them fast, deterministic, and low-noise in output.

## Pyramid
| Level | Tool | What | Where |
|---|---|---|---|
| Domain unit | Jest | entities math, state machine, use-cases with fakes | `features/*/domain/**/*.test.ts` |
| Headless hooks | Jest + `renderHook` | controlled/uncontrolled, a11y props, edge states | `design-system/headless/**` |
| Tokens | Jest | contrast pairs in all themes, scale invariants | `design-system/tokens/*.test.ts` |
| Components | RNTL | behavior via roles/labels; variants render without error | next to component |
| View-models | RNTL `renderHook` | loading/empty/error/success, handlers call use-cases | `presentation/*.test.ts(x)` |
| Repository contract | Jest | same suite for memory (now) and http (later) | `features/*/data/contract/*.ts` |
| E2E | Maestro | 5–8 critical flows on a dev build | `e2e/*.yaml` |
| Device QA | manual checklist | notifications, lock screen, kill/restore | docs/TIMER_AND_PRESENCE.md |

## Rules
- Test names start with the AC id: `AC3: stops from notification action twice -> single event`.
- Fake `Clock`, `IdGenerator`, storage, presence and scheduler ports (`src/test/fakes`). Builders in `src/test/builders`.
- Query by role/label/text, not testID; add `testID` only when no accessible handle exists.
- No snapshot tests for logic or screens. Allowed only for tiny static outputs (and rarely).
- No real timers/sleeps: fake timers + injected clock.
- Required edge cases per feature: empty, error, double-tap, killed-app restore, DST/time zone, midnight crossing,
  long text, 130% font scale, tr/en copy, light/dark/night.
- Coverage gates (CI): `domain` >= 90%, `design-system/headless` >= 85%, repo overall >= 70%. Gates are for catching gaps,
  not for padding.

## Setup (S00)
- `jest-expo` preset, `@testing-library/react-native`, jest setup mocking: MMKV (use memory adapter), Reanimated (official mock),
  notify-kit/expo-notifications/expo-widgets, Unistyles (per its testing docs), `expo-haptics`.
- Scripts: `test` (`jest`), `test:changed` (`jest --onlyChanged --silent`), `check` (typecheck && lint && test --silent).
- Keep output minimal: `--silent`, `--reporters=default` with failures only when possible. No verbose logs in tests.

## Maestro flows (S16, examples)
1. Create baby -> start breast timer -> switch side -> stop -> event in timeline.
2. Log diaper in 2 taps -> undo. 3. Add past bottle feed. 4. Change language/units. 5. Delete event -> undo.

## Tester agent contract
Derive from ACs, edit only test files/fakes/builders, never patch production code, report production bugs with file:line.
