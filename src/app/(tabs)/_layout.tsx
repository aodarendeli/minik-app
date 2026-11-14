import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';

import { useI18n } from '@/core/i18n';
import { useTheme } from '@/design-system';

/**
 * Native tab bar (UITabBar / Material bottom navigation): system blur, outline → filled icon on selection,
 * brand tint. iOS 26+ draws its own Liquid Glass bar and shrinks it while scrolling down.
 */
export default function TabsLayout() {
  const { t } = useI18n();
  const theme = useTheme();
  const c = theme.colors;
  const label = { fontSize: theme.typography.caption.fontSize, fontWeight: '600' as const };
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      blurEffect={theme.isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      shadowColor="transparent"
      backgroundColor={Platform.OS === 'ios' ? undefined : c.surface}
      tintColor={c.brand}
      indicatorColor={c.brandSoft}
      rippleColor={c.brandSoft}
      labelVisibilityMode="labeled"
      iconColor={{ default: c.textTertiary, selected: c.brand }}
      labelStyle={{ default: { ...label, color: c.textTertiary }, selected: { ...label, color: c.brand } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timeline">
        <NativeTabs.Trigger.Label>{t('tabs.timeline')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.rectangle.portrait', selected: 'list.bullet.rectangle.portrait.fill' }} md="view_timeline" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="health">
        <NativeTabs.Trigger.Label>{t('tabs.health')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'cross.case', selected: 'cross.case.fill' }} md="health_and_safety" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label>{t('tabs.reports')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="bar_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
