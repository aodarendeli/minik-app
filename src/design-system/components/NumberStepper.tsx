import { View } from 'react-native';

import { useStepper } from '../headless/use-stepper';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { IconButton } from './IconButton';

export type NumberStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  decrementLabel: string;
  incrementLabel: string;
};

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  unit,
  decrementLabel,
  incrementLabel,
}: NumberStepperProps) {
  const t = useTheme();
  const s = useStepper({ value, onChange, step, min, max });
  return (
    <View style={{ gap: t.space.xs }}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: unit ? `${value} ${unit}` : String(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => (e.nativeEvent.actionName === 'increment' ? s.increment() : s.decrement())}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.surfaceSunken,
          padding: t.space.xs,
        }}>
        <IconButton icon="back" label={decrementLabel} onPress={s.decrement} disabled={!s.canDecrement} variant="soft" />
        <Text variant="timerSm">
          {value}
          {unit ? ` ${unit}` : ''}
        </Text>
        <IconButton icon="forward" label={incrementLabel} onPress={s.increment} disabled={!s.canIncrement} variant="soft" />
      </View>
    </View>
  );
}
