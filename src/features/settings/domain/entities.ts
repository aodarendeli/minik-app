export type Locale = 'tr' | 'en';
export type ThemeSetting = 'system' | 'light' | 'dark' | 'night';
export type Palette = 'mint' | 'rose' | 'sky' | 'lavender' | 'peach';
export const PALETTES: readonly Palette[] = ['mint', 'rose', 'sky', 'lavender', 'peach'];
export type ParentRole = 'mother' | 'father' | 'caregiver';
export const PARENT_ROLES: readonly ParentRole[] = ['mother', 'father', 'caregiver'];

/** The person using the app on this device (never leaves the device). */
export type ParentProfile = { name: string; role: ParentRole };
/** Short enough for the greeting title on small phones. */
export const PARENT_NAME_MAX = 24;

/** First name for the greeting ("Günaydın Ayşe", not the full name). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

export type Settings = {
  locale: Locale;
  theme: ThemeSetting;
  palette: Palette;
  activeBabyId?: string;
  parent?: ParentProfile;
  /** First-run setup finished. */
  onboarded: boolean;
  /** Version of the terms/privacy/medical notice the parent accepted. */
  legalAccepted?: number;
};

/** Bump when the legal texts change: everyone is asked to accept again. */
export const LEGAL_VERSION = 1;

export function setupComplete(s: Settings): boolean {
  return s.onboarded && s.legalAccepted === LEGAL_VERSION;
}

export const DEFAULT_SETTINGS: Settings = { locale: 'tr', theme: 'system', palette: 'mint', onboarded: false };

export interface SettingsRepository {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<void>;
}

export function createSettingsUseCases({ settings }: { settings: SettingsRepository }) {
  return {
    getSettings: () => settings.get(),
    async updateSettings(patch: Partial<Settings>): Promise<Settings> {
      const next = { ...(await settings.get()), ...patch };
      await settings.save(next);
      return next;
    },
  };
}

export type SettingsUseCases = ReturnType<typeof createSettingsUseCases>;
