import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Shown under the label in the danger color (e.g. "consent required"). */
  error?: string;
  testID?: string;
};

/** Labeled checkbox; the whole row is the touch target (>=48dp). Checked state uses fill AND a check icon. */
export function Checkbox({ label, checked, onChange, error, testID }: CheckboxProps) {
  const t = useTheme();
  const a11y = usePressableA11y({ label, checked, role: 'checkbox', hint: error });
  const box = t.size.icon.lg;
  return (
    <Pressable
      {...a11y}
      testID={testID}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: t.space.md,
        minHeight: t.size.touchTarget,
        paddingVertical: t.space.xs,
        opacity: pressed ? t.opacity.pressed : 1,
      })}>
      <View
        style={{
          width: box,
          height: box,
          marginTop: t.space.xxs,
          borderRadius: t.radius.sm,
          borderWidth: t.size.focusRing,
          borderColor: t.colors[error ? 'danger' : checked ? 'brand' : 'borderStrong'],
          backgroundColor: checked ? t.colors.brand : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? <Icon name="check" size="sm" color="onBrand" /> : null}
      </View>
      <View style={{ flex: 1, gap: t.space.xxs }}>
        <Text variant="caption" color="textPrimary">
          {label}
        </Text>
        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
