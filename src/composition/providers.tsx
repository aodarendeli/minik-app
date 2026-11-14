import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { useState, type ReactNode } from 'react';

import { I18nProvider } from '@/core/i18n';
import { createQueryClient } from '@/core/query';
import { SnackbarProvider, ThemeProvider, useTheme } from '@/design-system';
import { ActiveBabyProvider, BabiesDeps } from '@/features/babies';
import { HealthDeps } from '@/features/health';
import { ReportsDeps } from '@/features/reports';
import { SettingsDeps, useSettings } from '@/features/settings';
import { TrackingDeps } from '@/features/tracking';

import { appInfo } from '@/platform/app-info';

import { createContainer, type Container } from './container';
import { SessionPresenceBridge } from './SessionPresenceBridge';

/** Maps design tokens onto React Navigation so headers and backgrounds follow the theme. */
function NavigationTheme({ children }: { children: ReactNode }) {
  const t = useTheme();
  const theme = {
    ...DefaultTheme,
    dark: t.isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: t.colors.brand,
      background: t.colors.canvas,
      card: t.colors.surface,
      text: t.colors.textPrimary,
      border: t.colors.borderSubtle,
      notification: t.colors.danger,
    },
  };
  return <NavigationThemeProvider value={theme}>{children}</NavigationThemeProvider>;
}

function SettingsDriven({ children }: { children: ReactNode }) {
  const settings = useSettings();
  return (
    <I18nProvider locale={settings.locale}>
      <ThemeProvider preference={settings.theme} palette={settings.palette}>
        <NavigationTheme>{children}</NavigationTheme>
      </ThemeProvider>
    </I18nProvider>
  );
}

type AppProvidersProps = {
  children: ReactNode;
  container?: Container;
  queryClient?: QueryClient;
};

/** Feature dependency contexts: use-cases built by the container, consumed via `XDeps.useDeps()`. */
function FeatureDeps({ container, children }: { container: Container; children: ReactNode }) {
  const { clock } = container;
  return (
    <BabiesDeps.Provider value={{ useCases: container.babies, clock, deleteBabyWithData: container.deleteBaby }}>
      <TrackingDeps.Provider value={{ useCases: container.tracking, clock }}>
        <HealthDeps.Provider value={{ useCases: container.health, records: container.records, clock, presets: container.healthPresets }}>
          <ReportsDeps.Provider value={{ useCases: container.reports, clock }}>{children}</ReportsDeps.Provider>
        </HealthDeps.Provider>
      </TrackingDeps.Provider>
    </BabiesDeps.Provider>
  );
}

export function AppProviders({ children, container: injectedContainer, queryClient: injectedClient }: AppProvidersProps) {
  const [container] = useState(() => injectedContainer ?? createContainer());
  const [queryClient] = useState(() => injectedClient ?? createQueryClient());
  const settingsDeps = {
    ...container.settings,
    clearAllData: container.clearAllData,
    loadDemoData: container.loadDemoData,
    appVersion: appInfo.version,
    supportEmail: appInfo.supportEmail,
  };
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsDeps.Provider value={settingsDeps}>
        <SettingsDriven>
          <FeatureDeps container={container}>
            <SnackbarProvider>
              <ActiveBabyProvider>
                <SessionPresenceBridge container={container} />
                {children}
              </ActiveBabyProvider>
            </SnackbarProvider>
          </FeatureDeps>
        </SettingsDriven>
      </SettingsDeps.Provider>
    </QueryClientProvider>
  );
}
