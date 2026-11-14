import { router } from 'expo-router';
import { useState } from 'react';

import { useI18n } from '@/core/i18n';
import {
  Badge,
  Button,
  Card,
  Divider,
  ListItem,
  Notice,
  ScreenContainer,
  SectionHeader,
  Stack,
  Text,
} from '@/design-system';
import { BABY_MAX, useActiveBaby, useBabyAgeLabel } from '@/features/babies';

import { PARENT_NAME_MAX, type ParentRole, type Settings } from '../domain';
import { AppearanceFields, LanguageField, ParentFields } from './components/AppearanceFields';
import { SettingsDeps } from './deps';
import { LEGAL_DOCS } from './LegalScreen';
import { useDeleteAllData } from './use-delete-all';
import { useSettings, useUpdateSettings } from './use-settings';

/** Parent name and role; saved as you type (empty names are not saved). */
function ParentSection({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const update = useUpdateSettings();
  const [name, setName] = useState(settings.parent?.name ?? '');
  const role: ParentRole = settings.parent?.role ?? 'mother';
  const save = (next: { name?: string; role?: ParentRole }) => {
    const trimmed = (next.name ?? name).trim().slice(0, PARENT_NAME_MAX);
    if (trimmed) update({ parent: { name: trimmed, role: next.role ?? role } });
  };
  return (
    <Stack gap="md">
      <SectionHeader title={t('settings.parent')} />
      <Card>
        <ParentFields
          name={name}
          role={role}
          onNameChange={(v) => {
            setName(v);
            save({ name: v });
          }}
          onRoleChange={(r) => save({ role: r })}
          nameLabel={t('settings.parentName')}
          roleLabel={t('settings.role')}
          nameError={name.trim() ? undefined : t('onboarding.parentNameError')}
        />
      </Card>
    </Stack>
  );
}

export function SettingsScreen() {
  const { t } = useI18n();
  const ageLabel = useBabyAgeLabel();
  const settings = useSettings();
  const { babies, baby, select } = useActiveBaby();
  const data = useDeleteAllData();
  const { appVersion } = SettingsDeps.useDeps();

  return (
    <ScreenContainer title={t('settings.title')}>
      <ParentSection settings={settings} />
      <Stack gap="md">
        <SectionHeader
          title={t('settings.babies')}
          action={babies.length < BABY_MAX ? { label: t('settings.addBaby'), onPress: () => router.push('/babies/new') } : undefined}
        />
        <Card padding="md" gap="none">
          {babies.map((b, i) => (
            <Stack key={b.id}>
              {i > 0 ? <Divider /> : null}
              <ListItem
                icon="baby"
                title={b.name}
                subtitle={ageLabel(b)}
                onPress={() => {
                  select(b.id);
                  router.push({ pathname: '/babies/new', params: { id: b.id } });
                }}
                trailing={b.id === baby?.id ? <Badge label={t('settings.active')} tone="brand" /> : undefined}
                showChevron
              />
            </Stack>
          ))}
        </Card>
        {babies.length >= BABY_MAX ? <Notice text={t('babyForm.limit', { max: BABY_MAX })} tone="info" /> : null}
        {babies.length === 0 ? <Button label={t('settings.addBaby')} icon="add" onPress={() => router.push('/babies/new')} /> : null}
      </Stack>

      <Stack gap="md">
        <SectionHeader title={t('settings.appearance')} />
        <Card gap="lg">
          <AppearanceFields settings={settings} />
        </Card>
      </Stack>

      <Stack gap="md">
        <SectionHeader title={t('settings.language')} />
        <Card>
          <LanguageField settings={settings} />
        </Card>
      </Stack>

      <Stack gap="md">
        <SectionHeader title={t('settings.data')} />
        <Notice text={t('settings.demoData')} tone="info" />
        <Button
          label={t('settings.deleteAll')}
          icon="delete"
          variant="outline"
          tone="danger"
          onPress={data.deleteAll}
          loading={data.deleting}
        />
        {/* {__DEV__ ? (
          <Button label={t('settings.loadDemo')} icon="history" variant="soft" tone="neutral" onPress={data.loadDemo} />
        ) : null} */}
      </Stack>

      <Stack gap="md">
        <SectionHeader title={t('legal.section')} />
        <Card padding="md" gap="none">
          {LEGAL_DOCS.map((doc, i) => (
            <Stack key={doc}>
              {i > 0 ? <Divider /> : null}
              <ListItem
                icon={doc === 'medical' ? 'health' : doc === 'privacy' ? 'lock' : 'info'}
                title={t(`legal.${doc}.title`)}
                onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc } })}
                showChevron
              />
            </Stack>
          ))}
        </Card>
        <Notice text={t('common.disclaimer')} />
        <Text variant="caption" color="textTertiary" align="center">
          {t('legal.version', { version: appVersion })}
        </Text>
      </Stack>
    </ScreenContainer>
  );
}
