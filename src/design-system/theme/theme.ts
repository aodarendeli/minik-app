import {
  dark,
  elevation,
  light,
  maxFontSizeMultiplier,
  motion,
  night,
  opacity,
  radius,
  size,
  space,
  typography,
  withPalette,
  zIndex,
  type PaletteName,
  type SemanticColors,
} from '@minik/design-tokens';

export type ThemeName = 'light' | 'dark' | 'night';
export type ThemePreference = 'system' | ThemeName;
export type { PaletteName };

export type Theme = {
  name: ThemeName;
  palette: PaletteName;
  isDark: boolean;
  colors: SemanticColors;
  space: typeof space;
  radius: typeof radius;
  size: typeof size;
  typography: typeof typography;
  opacity: typeof opacity;
  motion: typeof motion;
  elevation: typeof elevation;
  zIndex: typeof zIndex;
  maxFontSizeMultiplier: number;
};

function colorsFor(name: ThemeName, palette: PaletteName): SemanticColors {
  if (name === 'night') return night;
  return withPalette(name === 'light' ? light : dark, name, palette);
}

export function buildTheme(name: ThemeName, palette: PaletteName = 'mint'): Theme {
  return {
    name,
    palette,
    isDark: name !== 'light',
    colors: colorsFor(name, palette),
    space,
    radius,
    size,
    typography,
    opacity,
    motion,
    elevation,
    zIndex,
    maxFontSizeMultiplier,
  };
}
