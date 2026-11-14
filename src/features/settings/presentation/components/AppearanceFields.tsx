import type { ReactNode } from 'react';

import { useI18n } from '@/core/i18n';
import { Chip, ChipGroup, Notice, PalettePicker, SegmentedControl, Stack, Text, TextField } from '@/design-system';

import { PARENT_NAME_MAX, PARENT_ROLES, type Locale, type ParentRole, type Settings, type ThemeSetting } from '../../domain';
import { useUpdateSettings } from '../use-settings';

const THEMES: readonly ThemeSetting[] = ['system', 'light', 'dark', 'night'];
const LOCALES: readonly Locale[] = ['tr', 'en'];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="sm">
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/** Theme mode + color palette. Changes apply instantly, so the screen itself is the preview. */
export function AppearanceFields({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const update = useUpdateSettings();
  return (
    <>
      <SegmentedControl
        accessibilityLabel={t('settings.appearance')}
        value={settings.theme}
        onChange={(theme) => update({ theme })}
        options={THEMES.map((v) => ({ value: v, label: t(`settings.theme.${v}`) }))}
      />
      <Field label={t('settings.palette')}>
        <PalettePicker
          value={settings.palette}
          onChange={(palette) => update({ palette })}
          labelFor={(p) => t(`settings.palettes.${p}`)}
        />
      </Field>
      {settings.theme === 'night' ? <Notice text={t('settings.nightPaletteNote')} tone="info" /> : null}
    </>
  );
}

export function LanguageField({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const update = useUpdateSettings();
  return (
    <SegmentedControl
      accessibilityLabel={t('settings.language')}
      value={settings.locale}
      onChange={(locale) => update({ locale })}
      options={LOCALES.map((v) => ({ value: v, label: t(`settings.languages.${v}`) }))}
    />
  );
}

export type ParentFieldsProps = {
  name: string;
  role: ParentRole;
  onNameChange: (name: string) => void;
  onRoleChange: (role: ParentRole) => void;
  nameLabel: string;
  roleLabel: string;
  nameError?: string;
  autoFocus?: boolean;
};

export function ParentFields({ name, role, onNameChange, onRoleChange, nameLabel, roleLabel, nameError, autoFocus }: ParentFieldsProps) {
  const { t } = useI18n();
  return (
    <>
      <TextField
        label={nameLabel}
        value={name}
        onChangeText={onNameChange}
        placeholder={t('onboarding.parentNamePlaceholder')}
        error={nameError}
        autoFocus={autoFocus}
        maxLength={PARENT_NAME_MAX}
      />
      <Field label={roleLabel}>
        <ChipGroup>
          {PARENT_ROLES.map((r) => (
            <Chip key={r} label={t(`settings.roles.${r}`)} selected={role === r} onPress={() => onRoleChange(r)} />
          ))}
        </ChipGroup>
      </Field>
    </>
  );
}
