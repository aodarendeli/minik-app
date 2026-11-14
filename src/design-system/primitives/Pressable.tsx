import type { ReactNode } from 'react';
import { Pressable as RNPressable } from 'react-native';

import { type ColorToken, type RadiusToken, type SpaceToken } from '@minik/design-tokens';
import { usePressableA11y, type PressableA11yInput } from '../headless/use-pressable';
import { useTheme } from '../theme/ThemeProvider';

export type PressableProps = PressableA11yInput & {
  onPress?: () => void;
  onLongPress?: () => void;
  children: ReactNode;
  padding?: SpaceToken;
  radius?: RadiusToken;
  bg?: ColorToken;
  flex?: boolean;
  testID?: string;
};

/** Generic pressable surface with a11y, pressed feedback and a >=48dp minimum target. */
export function Pressable({ onPress, onLongPress, children, padding, radius, bg, flex, testID, ...a11y }: PressableProps) {
  const t = useTheme();
  const a11yProps = usePressableA11y(a11y);
  return (
    <RNPressable
      {...a11yProps}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        minHeight: t.size.touchTarget,
        flex: flex ? 1 : undefined,
        padding: padding ? t.space[padding] : undefined,
        borderRadius: radius ? t.radius[radius] : undefined,
        backgroundColor: bg ? t.colors[bg] : undefined,
        opacity: a11y.disabled ? t.opacity.disabled : pressed ? t.opacity.pressed : 1,
      })}>
      {children}
    </RNPressable>
  );
}
