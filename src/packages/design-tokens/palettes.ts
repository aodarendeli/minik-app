import type { SemanticColors } from './colors';

/** Accent palettes. Each tints the brand color and the backgrounds of the light and dark themes. */
export type PaletteName = 'mint' | 'rose' | 'sky' | 'lavender' | 'peach';
export const PALETTE_NAMES: readonly PaletteName[] = ['mint', 'rose', 'sky', 'lavender', 'peach'];

type PaletteColors = Pick<
  SemanticColors,
  'canvas' | 'surfaceSunken' | 'borderSubtle' | 'focus' | 'brand' | 'onBrand' | 'brandSoft' | 'onBrandSoft'
> &
  Partial<Pick<SemanticColors, 'surface' | 'surfaceRaised' | 'shadow'>>;

type Palette = { light: PaletteColors; dark: PaletteColors };

const brand = (solid: string, onSolid: string, soft: string, onSoft: string) => ({
  focus: solid,
  brand: solid,
  onBrand: onSolid,
  brandSoft: soft,
  onBrandSoft: onSoft,
});

export const palettes: Record<PaletteName, Palette> = {
  mint: {
    light: { shadow: 'rgba(15, 118, 110, 0.10)', canvas: '#F3F8F6', surfaceSunken: '#E6F0EC', borderSubtle: '#DDE9E4', ...brand('#0F766E', '#FFFFFF', '#D5F1EC', '#0B5550') },
    dark: {
      canvas: '#0F1413',
      surface: '#171D1C',
      surfaceRaised: '#1F2625',
      surfaceSunken: '#0A0E0D',
      borderSubtle: '#243030',
      ...brand('#2DD4BF', '#042F2E', '#123B37', '#99F6E4'),
    },
  },
  rose: {
    light: { shadow: 'rgba(190, 24, 93, 0.10)', canvas: '#FDF6F8', surfaceSunken: '#F8E9EE', borderSubtle: '#F1DDE4', ...brand('#BE185D', '#FFFFFF', '#FCE7F3', '#9D174D') },
    dark: {
      canvas: '#151012',
      surface: '#1E171A',
      surfaceRaised: '#271E22',
      surfaceSunken: '#0D0A0B',
      borderSubtle: '#30252A',
      ...brand('#F472B6', '#3B0A23', '#3D1529', '#FBCFE8'),
    },
  },
  sky: {
    light: { shadow: 'rgba(3, 105, 161, 0.10)', canvas: '#F4F8FC', surfaceSunken: '#E6EEF7', borderSubtle: '#DCE6F0', ...brand('#0369A1', '#FFFFFF', '#E0F2FE', '#075985') },
    dark: {
      canvas: '#0E1217',
      surface: '#161B22',
      surfaceRaised: '#1E242C',
      surfaceSunken: '#090C10',
      borderSubtle: '#252D37',
      ...brand('#38BDF8', '#062033', '#0C2A40', '#BAE6FD'),
    },
  },
  lavender: {
    light: { shadow: 'rgba(124, 58, 237, 0.10)', canvas: '#F8F6FD', surfaceSunken: '#EDE9F7', borderSubtle: '#E4DFF2', ...brand('#7C3AED', '#FFFFFF', '#EDE9FE', '#5B21B6') },
    dark: {
      canvas: '#121018',
      surface: '#1A1722',
      surfaceRaised: '#221E2C',
      surfaceSunken: '#0B0A10',
      borderSubtle: '#2C2738',
      ...brand('#A78BFA', '#1E1038', '#261B45', '#DDD6FE'),
    },
  },
  peach: {
    light: { shadow: 'rgba(176, 74, 28, 0.10)', canvas: '#FDF7F2', surfaceSunken: '#F7EAE0', borderSubtle: '#F0E0D3', ...brand('#B04A1C', '#FFFFFF', '#FFEDD5', '#9A3412') },
    dark: {
      canvas: '#15110E',
      surface: '#1E1915',
      surfaceRaised: '#27201B',
      surfaceSunken: '#0D0A08',
      borderSubtle: '#302720',
      ...brand('#FDBA74', '#3A1A05', '#3A2212', '#FED7AA'),
    },
  },
};

/** Applies a palette to a base theme. The dim night theme keeps its own colors so 3 a.m. feeds stay low-glare. */
export function withPalette(base: SemanticColors, mode: 'light' | 'dark', name: PaletteName): SemanticColors {
  return { ...base, ...palettes[name][mode] };
}
