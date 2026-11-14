import { ActivityIndicator, Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import type { IconName } from '../primitives/icons';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  hint?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'solid',
  tone = 'brand',
  size = 'md',
  icon,
  loading,
  disabled,
  fullWidth,
  hint,
  testID,
}: ButtonProps) {
  const t = useTheme();
  const c = tones[tone];
  const isDisabled = disabled || loading;
  const a11y = usePressableA11y({ label, hint, disabled: isDisabled, busy: loading });
  const bg = variant === 'solid' ? c.solid : variant === 'soft' ? c.soft : undefined;
  const fg = variant === 'solid' ? c.onSolid : variant === 'soft' ? c.onSoft : c.solid;
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: t.size.control[size],
        paddingHorizontal: size === 'sm' ? t.space.md : t.space.xl,
        borderRadius: t.radius.pill,
        backgroundColor: bg ? t.colors[bg] : 'transparent',
        borderWidth: variant === 'outline' ? t.size.hairline : 0,
        borderColor: t.colors[c.solid],
        alignSelf: fullWidth ? 'stretch' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? t.opacity.disabled : pressed ? t.opacity.pressed : 1,
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
        {loading ? (
          <ActivityIndicator color={t.colors[fg]} />
        ) : icon ? (
          <Icon name={icon} size="md" color={fg} />
        ) : null}
        <Text variant={size === 'lg' ? 'bodyStrong' : 'label'} color={fg} capScale numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
