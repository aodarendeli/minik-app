/**
 * Semantic color contract. Themes differ only in these values; components never use raw hex.
 * Keys are flat so typed props (`bg="surface"`) stay simple.
 */
export type SemanticColors = {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  focus: string;
  brand: string;
  onBrand: string;
  brandSoft: string;
  onBrandSoft: string;
  success: string;
  onSuccess: string;
  successSoft: string;
  onSuccessSoft: string;
  warning: string;
  onWarning: string;
  warningSoft: string;
  onWarningSoft: string;
  danger: string;
  onDanger: string;
  dangerSoft: string;
  onDangerSoft: string;
  info: string;
  onInfo: string;
  infoSoft: string;
  onInfoSoft: string;
  feeding: string;
  onFeeding: string;
  feedingSoft: string;
  onFeedingSoft: string;
  diaper: string;
  onDiaper: string;
  diaperSoft: string;
  onDiaperSoft: string;
  sleep: string;
  onSleep: string;
  sleepSoft: string;
  onSleepSoft: string;
  health: string;
  onHealth: string;
  healthSoft: string;
  onHealthSoft: string;
  scrim: string;
  /** Soft drop shadow for raised surfaces; transparent where depth comes from surface color (dark themes). */
  shadow: string;
};

export type ColorToken = keyof SemanticColors;

export const light: SemanticColors = {
  canvas: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#EFECE7',
  textPrimary: '#1F2328',
  textSecondary: '#545D68',
  textTertiary: '#6A7380',
  textDisabled: '#A8AFB6',
  textInverse: '#FFFFFF',
  borderSubtle: '#E7E3DD',
  borderDefault: '#D5D0C8',
  borderStrong: '#8F8A82',
  focus: '#0F766E',
  brand: '#0F766E',
  onBrand: '#FFFFFF',
  brandSoft: '#D5F1EC',
  onBrandSoft: '#0B5550',
  success: '#1A7F37',
  onSuccess: '#FFFFFF',
  successSoft: '#DDF4E4',
  onSuccessSoft: '#135C28',
  warning: '#8A5A00',
  onWarning: '#FFFFFF',
  warningSoft: '#FFF1CC',
  onWarningSoft: '#6B4600',
  danger: '#C62828',
  onDanger: '#FFFFFF',
  dangerSoft: '#FDE2E1',
  onDangerSoft: '#8E1B1B',
  info: '#0B63C5',
  onInfo: '#FFFFFF',
  infoSoft: '#DCEBFF',
  onInfoSoft: '#0A4F9E',
  feeding: '#C2410C',
  onFeeding: '#FFFFFF',
  feedingSoft: '#FDE7DD',
  onFeedingSoft: '#9A3412',
  diaper: '#946000',
  onDiaper: '#FFFFFF',
  diaperSoft: '#FEF3C7',
  onDiaperSoft: '#7A4A06',
  sleep: '#4F46E5',
  onSleep: '#FFFFFF',
  sleepSoft: '#E0E7FF',
  onSleepSoft: '#3730A3',
  health: '#15803D',
  onHealth: '#FFFFFF',
  healthSoft: '#DCFCE7',
  onHealthSoft: '#166534',
  scrim: 'rgba(15, 18, 20, 0.5)',
  shadow: 'rgba(31, 35, 40, 0.08)',
};

export const dark: SemanticColors = {
  canvas: '#101214',
  surface: '#1A1D21',
  surfaceRaised: '#22262B',
  surfaceSunken: '#0B0C0E',
  textPrimary: '#ECEDEE',
  textSecondary: '#AEB4BB',
  textTertiary: '#8F969E',
  textDisabled: '#5A6068',
  textInverse: '#101214',
  borderSubtle: '#262A30',
  borderDefault: '#343A41',
  borderStrong: '#6B727A',
  focus: '#5EEAD4',
  brand: '#2DD4BF',
  onBrand: '#042F2E',
  brandSoft: '#123B37',
  onBrandSoft: '#99F6E4',
  success: '#4ADE80',
  onSuccess: '#052E16',
  successSoft: '#0F2E1B',
  onSuccessSoft: '#86EFAC',
  warning: '#FBBF24',
  onWarning: '#2D1F00',
  warningSoft: '#33280A',
  onWarningSoft: '#FCD34D',
  danger: '#F87171',
  onDanger: '#2B0A0A',
  dangerSoft: '#3B1414',
  onDangerSoft: '#FCA5A5',
  info: '#60A5FA',
  onInfo: '#0A1A33',
  infoSoft: '#0F2440',
  onInfoSoft: '#93C5FD',
  feeding: '#FB923C',
  onFeeding: '#2A1205',
  feedingSoft: '#3A1E10',
  onFeedingSoft: '#FDBA74',
  diaper: '#FACC15',
  onDiaper: '#2A2005',
  diaperSoft: '#332A08',
  onDiaperSoft: '#FDE047',
  sleep: '#A5B4FC',
  onSleep: '#151642',
  sleepSoft: '#1E1F45',
  onSleepSoft: '#C7D2FE',
  health: '#4ADE80',
  onHealth: '#052E16',
  healthSoft: '#0F2E1B',
  onHealthSoft: '#86EFAC',
  scrim: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0)',
};

/** Dim, warm, low-glare theme for 3 a.m. feeds. Max text luminance stays below pure white. */
export const night: SemanticColors = {
  canvas: '#0E0B09',
  surface: '#17120F',
  surfaceRaised: '#1F1915',
  surfaceSunken: '#090706',
  textPrimary: '#D9CBBE',
  textSecondary: '#A8998B',
  textTertiary: '#8E8072',
  textDisabled: '#54493F',
  textInverse: '#0E0B09',
  borderSubtle: '#241D18',
  borderDefault: '#33291F',
  borderStrong: '#6B5E51',
  focus: '#D9A066',
  brand: '#6FB3A8',
  onBrand: '#0E0B09',
  brandSoft: '#1E2A27',
  onBrandSoft: '#A9D6CE',
  success: '#8DBF8A',
  onSuccess: '#0E0B09',
  successSoft: '#1B2419',
  onSuccessSoft: '#B5D6B2',
  warning: '#D9B26A',
  onWarning: '#0E0B09',
  warningSoft: '#2A2214',
  onWarningSoft: '#E6CC99',
  danger: '#D98B7E',
  onDanger: '#0E0B09',
  dangerSoft: '#2E1915',
  onDangerSoft: '#E8B2A8',
  info: '#8FA9CF',
  onInfo: '#0E0B09',
  infoSoft: '#182030',
  onInfoSoft: '#B8C9E3',
  feeding: '#D9926B',
  onFeeding: '#0E0B09',
  feedingSoft: '#2E1D14',
  onFeedingSoft: '#E8B89C',
  diaper: '#D1B46A',
  onDiaper: '#0E0B09',
  diaperSoft: '#2B2414',
  onDiaperSoft: '#E3CF9D',
  sleep: '#A3A5D6',
  onSleep: '#0E0B09',
  sleepSoft: '#1E1D30',
  onSleepSoft: '#C7C8E8',
  health: '#8DBF8A',
  onHealth: '#0E0B09',
  healthSoft: '#1B2419',
  onHealthSoft: '#B5D6B2',
  scrim: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0)',
};
