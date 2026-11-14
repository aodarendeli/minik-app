# @minik/design-tokens

Single source of truth for Minik's visual language, with no runtime dependencies.

- `light`, `dark`, `night`: semantic colors (`canvas`, `surface`, `textPrimary`, `brand`, `feeding`, …). Contrast is
  tested (WCAG AA) in `__tests__/contrast.test.ts`.
- `space`, `radius`, `size`, `typography`, `opacity`, `motion`, `zIndex`: scales.
- `tones`: solid / onSolid / soft / onSoft groups per tone (`brand`, `feeding`, `sleep`, …).
- `cssVariables(colors)` / `cssVariablesBlock(selector, colors)`: the same tokens as CSS custom properties
  (`--minik-color-brand`, `--minik-space-lg`, …) for web surfaces. The Keycloak login theme uses these.

Consumers: `src/design-system` (React Native) and `keycloak-theme/` (Keycloakify). Change a color here and both follow.
