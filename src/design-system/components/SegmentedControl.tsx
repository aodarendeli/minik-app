import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type SegmentOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: SegmentedControlProps<T>) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        padding: t.space.xxs,
        gap: t.space.xxs,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.surfaceSunken,
      }}>
      {options.map((o) => (
        <Segment key={o.value} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </View>
  );
}

function Segment({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  const a11y = usePressableA11y({ label, selected, role: 'tab' });
  return (
    <Pressable
      {...a11y}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: t.size.control.sm,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: t.space.sm,
        backgroundColor: selected ? t.colors.surfaceRaised : 'transparent',
        borderWidth: selected ? t.size.hairline : 0,
        borderColor: t.colors.borderDefault,
      }}>
      <Text variant="label" color={selected ? 'textPrimary' : 'textSecondary'} capScale numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
