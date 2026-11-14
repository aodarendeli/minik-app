import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type HeroCardProps = {
  title: string;
  subtitle?: string;
  /** Leading visual, e.g. a large Avatar. */
  media?: ReactNode;
  /** Extra content under the title row (e.g. a key fact). */
  children?: ReactNode;
  tone?: Tone;
  /** Makes the header row pressable (e.g. edit baby). */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Colorful top-of-screen card with soft decorative circles. Circles are pure decoration (hidden from
 * screen readers, static, so reduce-motion safe) and positioned with start/end for RTL.
 */
export function HeroCard({ title, subtitle, media, children, tone = 'brand', onPress, accessibilityLabel }: HeroCardProps) {
  const t = useTheme();
  const c = tones[tone];
  const a11y = usePressableA11y({ label: accessibilityLabel ?? title });
  const circle = (size: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors[c.solid],
    opacity: t.isDark ? 0.18 : 0.12,
  });
  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.lg }}>
      {media}
      <View style={{ flex: 1, gap: t.space.xxs }}>
        <Text variant="title1" color={c.onSoft} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text color={c.onSoft} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: t.radius.xl,
        padding: t.space.xl,
        gap: t.space.lg,
        backgroundColor: t.colors[c.soft],
        boxShadow: `${t.elevation.md} ${t.colors.shadow}`,
      }}>
      <View accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        <View style={{ ...circle(t.size.avatar.lg * 2.5), top: -t.size.avatar.lg, end: -t.size.avatar.md }} />
        <View style={{ ...circle(t.size.avatar.lg), bottom: -t.space.xl, end: t.size.avatar.lg * 1.5 }} />
        <View style={{ ...circle(t.size.avatar.sm), top: t.space.lg, end: t.size.avatar.lg * 2.5 }} />
      </View>
      {onPress ? (
        <Pressable {...a11y} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? t.opacity.pressed : 1 })}>
          {header}
        </Pressable>
      ) : (
        header
      )}
      {children}
    </View>
  );
}
