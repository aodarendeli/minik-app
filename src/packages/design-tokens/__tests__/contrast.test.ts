import { dark, light, night, type ColorToken, type SemanticColors } from '../colors';
import { cssVariables, cssVariablesBlock } from '../css';
import { PALETTE_NAMES, withPalette } from '../palettes';
import { tones } from '../tones';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (ch[0] ?? 0) + 0.7152 * (ch[1] ?? 0) + 0.0722 * (ch[2] ?? 0);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

const themes: Record<string, SemanticColors> = { light, dark, night };
for (const name of PALETTE_NAMES) {
  themes[`light/${name}`] = withPalette(light, 'light', name);
  themes[`dark/${name}`] = withPalette(dark, 'dark', name);
}
const textOn: [ColorToken, ColorToken][] = [
  ['textPrimary', 'canvas'],
  ['textPrimary', 'surface'],
  ['textSecondary', 'canvas'],
  ['textSecondary', 'surface'],
  ['textTertiary', 'surface'],
  ['textSecondary', 'surfaceSunken'],
  ['textInverse', 'textPrimary'],
];

describe.each(Object.entries(themes))('%s theme contrast (WCAG AA)', (_, c) => {
  it.each(textOn)('%s on %s >= 4.5', (fg, bg) => {
    expect(contrast(c[fg], c[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(tones))('tone %s: onSolid/onSoft >= 4.5', (_, tone) => {
    expect(contrast(c[tone.onSolid], c[tone.solid])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c[tone.onSoft], c[tone.soft])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('cssVariables', () => {
  it('exposes colors and scales as CSS custom properties', () => {
    const vars = cssVariables(light);
    expect(vars['--minik-color-text-primary']).toBe(light.textPrimary);
    expect(vars['--minik-space-lg']).toBe('16px');
    expect(vars['--minik-font-title1-size']).toBe('24px');
    expect(cssVariablesBlock(':root', night)).toContain(`--minik-color-canvas: ${night.canvas};`);
  });
});
