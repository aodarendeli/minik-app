import { Pressable } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type IconButtonProps = {
  icon: IconName;
  /** Required: icon-only buttons must be labelled for screen readers. */
  label: string;
  onPress: () => void;
  tone?: Tone;
  variant?: 'soft' | 'ghost' | 'solid';
  disabled?: boolean;
  testID?: string;
};

export function IconButton({ icon, label, onPress, tone = 'neutral', variant = 'ghost', disabled, testID }: IconButtonProps) {
  const t = useTheme();
  const c = tones[tone];
  const a11y = usePressableA11y({ label, disabled });
  const bg = variant === 'solid' ? c.solid : variant === 'soft' ? c.soft : undefined;
  const fg = variant === 'solid' ? c.onSolid : variant === 'soft' ? c.onSoft : tone === 'neutral' ? 'textSecondary' : c.solid;
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      hitSlop={t.space.xs}
      style={({ pressed }) => ({
        width: t.size.touchTarget,
        height: t.size.touchTarget,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg ? t.colors[bg] : 'transparent',
        opacity: disabled ? t.opacity.disabled : pressed ? t.opacity.pressed : 1,
      })}>
      <Icon name={icon} size="lg" color={fg} />
    </Pressable>
  );
}
