import { Pressable, View } from 'react-native';

import { usePressableA11y } from '../headless/use-pressable';
import { Icon } from '../primitives/Icon';
import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { PALETTE_NAMES, palettes, type PaletteName } from '@minik/design-tokens';

export type PalettePickerProps = {
  value: PaletteName;
  onChange: (palette: PaletteName) => void;
  /** Visible + accessible name of each palette (from i18n). */
  labelFor: (palette: PaletteName) => string;
};

function Swatch({ name, label, selected, onPress }: { name: PaletteName; label: string; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  const mode = t.isDark ? 'dark' : 'light';
  const p = palettes[name][mode];
  const a11y = usePressableA11y({ label, selected, role: 'radio' });
  const outer = t.size.control.md;
  const inner = t.size.icon.xl;
  return (
    <Pressable
      {...a11y}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, minWidth: 0, alignItems: 'center', gap: t.space.xs, opacity: pressed ? t.opacity.pressed : 1 })}>
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: t.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: p.brandSoft,
          borderWidth: t.size.focusRing,
          borderColor: selected ? p.brand : 'transparent',
        }}>
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: t.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: p.brand,
          }}>
          {selected ? <Icon name="check" size="sm" rawColor={p.onBrand} /> : null}
        </View>
      </View>
      <Text variant="caption" color={selected ? 'textPrimary' : 'textSecondary'} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Row of color swatches for choosing an accent palette. Selection is shown with a ring AND a check icon. */
export function PalettePicker({ value, onChange, labelFor }: PalettePickerProps) {
  const t = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: t.space.xs }}>
      {PALETTE_NAMES.map((name) => (
        <Swatch key={name} name={name} label={labelFor(name)} selected={name === value} onPress={() => onChange(name)} />
      ))}
    </View>
  );
}
