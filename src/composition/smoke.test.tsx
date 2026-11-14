import { fireEvent, render, screen } from '@testing-library/react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { sequentialIds } from '@/core/ids';
import { unwrap } from '@/core/result';
import { createQueryClient } from '@/core/query';
import { memoryStorage } from '@/core/storage/key-value';
import { fixedClock } from '@/core/time';
import { GrowthFormScreen, HealthScreen, LabFormScreen, MedFormScreen } from '@/features/health';
import { ReportsScreen } from '@/features/reports';
import { OnboardingScreen, SettingsScreen } from '@/features/settings';
import { TimelineScreen, TodayScreen } from '@/features/tracking';
import { NOON } from '@/test/builders';

import { createContainer } from './container';
import { AppProviders } from './providers';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useNavigationContainerRef: () => ({ isReady: () => true }),
  Stack: { Screen: () => null },
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  DefaultTheme: { dark: false, colors: {} },
}));
jest.mock('@/platform/pdf-exporter', () => ({ expoPdfExporter: { exportPdf: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('@/platform/storage', () => ({ deviceStorage: null }));
jest.mock('@/platform/session-presence', () => ({ createSessionPresence: jest.fn() }));

const fakePresence = () => ({
  configure: jest.fn().mockResolvedValue(undefined),
  show: jest.fn().mockResolvedValue(undefined),
  hide: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(() => () => undefined),
});

async function renderWith(ui: React.ReactElement, { seedDemoData = true } = {}) {
  const container = createContainer({ clock: fixedClock(NOON), ids: sequentialIds(), storage: memoryStorage(), presence: fakePresence, seedDemoData });
  const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
  const queryClient = createQueryClient({ gcTime: Infinity, retry: 0 });
  return {
    appContainer: container,
    ...(await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <AppProviders container={container} queryClient={queryClient}>
          {ui}
        </AppProviders>
      </SafeAreaProvider>,
    )),
  };
}

describe('screens render with demo data', () => {
  it('Today shows the baby and quick actions', async () => {
    await renderWith(<TodayScreen />);
    expect(await screen.findByText('Deniz')).toBeTruthy();
    expect(screen.getByText('Hızlı kayıt')).toBeTruthy();
    expect(screen.getByText('Bugünün özeti')).toBeTruthy();
  });

  it('Timeline, Health, Settings render', async () => {
    await renderWith(<TimelineScreen />);
    expect(await screen.findByText('Akış')).toBeTruthy();
    await renderWith(<HealthScreen />);
    expect(await screen.findByText('Tam kan sayımı')).toBeTruthy();
    await renderWith(<SettingsScreen />);
    expect(await screen.findByText('Bebekler')).toBeTruthy();
  });

  it('Reports exports a PDF through the exporter port', async () => {
    const { expoPdfExporter } = jest.requireMock('@/platform/pdf-exporter');
    await renderWith(<ReportsScreen />);
    const button = await screen.findByLabelText('PDF oluştur ve paylaş');
    await screen.findByText('Özet');
    await fireEvent.press(button);
    expect(expoPdfExporter.exportPdf).toHaveBeenCalledTimes(1);
    const doc = expoPdfExporter.exportPdf.mock.calls[0][0];
    expect(doc.html).toContain('Haftalık Bakım Raporu');
    expect(doc.html).toContain('Beslenme');
    expect(doc.html).toContain('Kayıt dökümü');
    expect(doc.fileName).toMatch(/^Deniz-2026-11-09_2026-11-15$/);
  });
});

describe('onboarding', () => {
  it('saves the parent, the first baby and the look, then marks setup finished', async () => {
    const { appContainer } = await renderWith(<OnboardingScreen />, { seedDemoData: false });
    await fireEvent.press(await screen.findByTestId('onboarding-start'));
    expect(screen.getByText('Devam etmek için onay vermen gerekiyor.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onboarding-consent'));
    await fireEvent.press(screen.getByTestId('onboarding-start'));

    await fireEvent.changeText(await screen.findByLabelText('Adın'), 'Ayşe');
    await fireEvent.press(screen.getByLabelText('Anne'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await fireEvent.changeText(await screen.findByLabelText('Adı'), 'Ela');
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await fireEvent.press(await screen.findByLabelText('Lavanta'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));

    await screen.findByText('Sana uygun görünümü seç');
    const settings = await appContainer.settings.getSettings();
    expect(settings).toMatchObject({ onboarded: true, legalAccepted: 1, palette: 'lavender', parent: { name: 'Ayşe', role: 'mother' } });
    const babies = unwrap(await appContainer.babies.listBabies());
    expect(babies.map((b) => b.name)).toEqual(['Ela']);
  });
});

describe('lab form templates', () => {
  it('fills title and value rows from a template', async () => {
    await renderWith(<LabFormScreen />);
    await fireEvent.press(await screen.findByLabelText('Tam kan sayımı'));
    expect(screen.getByDisplayValue('Tam kan sayımı')).toBeTruthy();
    expect(screen.getByDisplayValue('Hemoglobin')).toBeTruthy();
    expect(screen.getByLabelText('Tam kan sayımı').props.accessibilityState).toMatchObject({ selected: true });
  });
});

describe('growth and vaccine records', () => {
  it('switches Health sections and saves entries from the forms', async () => {
    await renderWith(<HealthScreen />);
    await fireEvent.press(await screen.findByLabelText('Büyüme'));
    expect(await screen.findByText('Henüz ölçüm yok')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Aşı & İlaç'));
    expect(await screen.findByText('Aşı ekle')).toBeTruthy();

    const { appContainer: c1 } = await renderWith(<GrowthFormScreen />);
    await fireEvent.changeText(await screen.findByLabelText('Kilo'), '5,4');
    await fireEvent.press(screen.getByText('Kaydet'));
    const growth = await c1.records.listGrowth('baby-demo');
    expect(growth.ok && growth.value.map((g) => g.weightKg)).toEqual([5.4]);

    const { appContainer: c2 } = await renderWith(<MedFormScreen kind="vaccine" />);
    await fireEvent.changeText(await screen.findByLabelText('Adı'), 'Hepatit B');
    await fireEvent.press(screen.getByText('Sonraki tarih ve hatırlatma ekle'));
    await fireEvent.press(screen.getByText('Kaydet'));
    const meds = await c2.records.listMeds('baby-demo');
    expect(meds.ok && meds.value.map((m) => [m.name, m.kind, m.nextOn !== undefined])).toEqual([['Hepatit B', 'vaccine', true]]);
  });
});
