import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/composition/providers';
import { useI18n } from '@/core/i18n';
import { useTheme } from '@/design-system';
import { setupComplete, useSettings, useSettingsReady } from '@/features/settings';

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { t } = useI18n();
  const theme = useTheme();
  const ready = useSettingsReady();
  const onboarded = setupComplete(useSettings());
  const modal = { presentation: 'modal' as const };

  // Keep the splash until settings are read, so returning parents never see onboarding flash.
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.textPrimary,
          contentStyle: { backgroundColor: theme.colors.canvas },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="legal/[doc]" options={modal} />
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="log/breast" options={{ ...modal, title: t('timer.breastTitle') }} />
          <Stack.Screen name="log/sleep" options={{ ...modal, title: t('timer.sleepTitle') }} />
          <Stack.Screen name="log/bottle" options={{ ...modal, title: t('log.bottleTitle') }} />
          <Stack.Screen name="log/diaper" options={{ ...modal, title: t('log.diaperTitle') }} />
          <Stack.Screen name="log/solid" options={{ ...modal, title: t('log.solidTitle') }} />
          <Stack.Screen name="labs/new" options={{ ...modal, title: t('labForm.newTitle') }} />
          <Stack.Screen name="labs/[id]" options={{ title: t('health.detailTitle') }} />
          <Stack.Screen name="growth/new" options={{ ...modal, title: t('records.growthNewTitle') }} />
          <Stack.Screen name="meds/new" options={{ ...modal, title: t('records.medNewVaccine') }} />
          <Stack.Screen name="babies/new" options={{ ...modal, title: t('babyForm.newTitle') }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}
