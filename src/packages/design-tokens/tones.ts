import type { ColorToken } from './colors';

/** A tone groups the four colors a component needs: solid fill, text on it, soft fill, text on soft. */
export type Tone =
  | 'brand'
  | 'neutral'
  | 'feeding'
  | 'diaper'
  | 'sleep'
  | 'health'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ToneColors = { solid: ColorToken; onSolid: ColorToken; soft: ColorToken; onSoft: ColorToken };

export const tones: Record<Tone, ToneColors> = {
  brand: { solid: 'brand', onSolid: 'onBrand', soft: 'brandSoft', onSoft: 'onBrandSoft' },
  neutral: { solid: 'textPrimary', onSolid: 'textInverse', soft: 'surfaceSunken', onSoft: 'textPrimary' },
  feeding: { solid: 'feeding', onSolid: 'onFeeding', soft: 'feedingSoft', onSoft: 'onFeedingSoft' },
  diaper: { solid: 'diaper', onSolid: 'onDiaper', soft: 'diaperSoft', onSoft: 'onDiaperSoft' },
  sleep: { solid: 'sleep', onSolid: 'onSleep', soft: 'sleepSoft', onSoft: 'onSleepSoft' },
  health: { solid: 'health', onSolid: 'onHealth', soft: 'healthSoft', onSoft: 'onHealthSoft' },
  success: { solid: 'success', onSolid: 'onSuccess', soft: 'successSoft', onSoft: 'onSuccessSoft' },
  warning: { solid: 'warning', onSolid: 'onWarning', soft: 'warningSoft', onSoft: 'onWarningSoft' },
  danger: { solid: 'danger', onSolid: 'onDanger', soft: 'dangerSoft', onSoft: 'onDangerSoft' },
  info: { solid: 'info', onSolid: 'onInfo', soft: 'infoSoft', onSoft: 'onInfoSoft' },
};
