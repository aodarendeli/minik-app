/** Non-color tokens. Plain TS objects so a styling-library swap only touches theme/ and primitives. */
export const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const size = {
  touchTarget: 48,
  control: { sm: 40, md: 48, lg: 56 },
  icon: { sm: 16, md: 20, lg: 24, xl: 32 },
  avatar: { sm: 32, md: 48, lg: 72 },
  hairline: 1,
  focusRing: 2,
  chartHeight: 120,
  contentMaxWidth: 720,
} as const;

type TypeStyle = {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  tabular?: boolean;
};

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  title1: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  title2: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: '700', tabular: true },
  timerSm: { fontSize: 28, lineHeight: 36, fontWeight: '700', tabular: true },
} as const satisfies Record<string, TypeStyle>;

/** Elevation: CSS box-shadow geometry; the color comes from the theme's `shadow` token. */
export const elevation = { none: '0 0 0', sm: '0 2px 8px', md: '0 6px 20px' } as const;

export const opacity = { disabled: 0.4, pressed: 0.85, scrim: 0.5 } as const;

export const motion = {
  duration: { instant: 80, fast: 150, base: 250, slow: 400 },
} as const;

export const zIndex = { base: 0, sticky: 10, overlay: 100, modal: 200, toast: 300 } as const;

export const maxFontSizeMultiplier = 1.3;

export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
export type TypeVariant = keyof typeof typography;
export type IconSize = keyof typeof size.icon;
