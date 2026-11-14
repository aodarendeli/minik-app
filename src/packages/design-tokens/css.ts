import type { SemanticColors } from './colors';
import { radius, space, typography } from './scales';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * Design tokens as CSS custom properties, for web surfaces that must match the app
 * (e.g. the Keycloak login theme). `--{prefix}-color-text-primary`, `--{prefix}-space-lg`, …
 */
export function cssVariables(colors: SemanticColors, prefix = 'minik'): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) vars[`--${prefix}-color-${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(space)) vars[`--${prefix}-space-${k}`] = `${v}px`;
  for (const [k, v] of Object.entries(radius)) vars[`--${prefix}-radius-${k}`] = `${v}px`;
  for (const [k, v] of Object.entries(typography)) {
    vars[`--${prefix}-font-${kebab(k)}-size`] = `${v.fontSize}px`;
    vars[`--${prefix}-font-${kebab(k)}-line`] = `${v.lineHeight}px`;
    vars[`--${prefix}-font-${kebab(k)}-weight`] = v.fontWeight;
  }
  return vars;
}

/** `selector { --a: b; … }` block for a stylesheet. */
export function cssVariablesBlock(selector: string, colors: SemanticColors, prefix = 'minik'): string {
  const body = Object.entries(cssVariables(colors, prefix))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}
