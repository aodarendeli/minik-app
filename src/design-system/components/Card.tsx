import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { useTheme } from '../theme/ThemeProvider';
import { type SpaceToken, type Tone, tones } from '@minik/design-tokens';

export type CardProps = {
  children: ReactNode;
  /** Soft tinted background instead of the neutral surface. */
  tone?: Tone;
  padding?: SpaceToken;
  gap?: SpaceToken;
  onPress?: () => void;
  /** Required when `onPress` is set. */
  accessibilityLabel?: string;
  testID?: string;
};

export function Card({ children, tone, padding = 'lg', gap = 'md', onPress, accessibilityLabel, testID }: CardProps) {
  const t = useTheme();
  const a11y = usePressableA11y({ label: accessibilityLabel ?? '' });
  const base = {
    padding: t.space[padding],
    gap: t.space[gap],
    borderRadius: t.radius.xl,
    backgroundColor: t.colors[tone ? tones[tone].soft : 'surface'],
    // Light themes: depth from a soft palette-tinted shadow. Dark themes: a hairline (shadows don't read on dark).
    borderWidth: tone || !t.isDark ? 0 : t.size.hairline,
    borderColor: t.colors.borderSubtle,
    boxShadow: tone ? undefined : `${t.elevation.sm} ${t.colors.shadow}`,
  };
  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? t.opacity.pressed : 1 }]}>
      {children}
    </Pressable>
  );
}
