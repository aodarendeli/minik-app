import { useState } from 'react';
import { TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string;
  /** Unit or suffix shown inside the field (e.g. "ml"). */
  suffix?: string;
  keyboard?: 'default' | 'number' | 'decimal';
  multiline?: boolean;
  autoFocus?: boolean;
  /** Hard cap on characters (matches the domain limit). */
  maxLength?: number;
  testID?: string;
};

const keyboardMap: Record<NonNullable<TextFieldProps['keyboard']>, KeyboardTypeOptions> = {
  default: 'default',
  number: 'number-pad',
  decimal: 'decimal-pad',
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  suffix,
  keyboard = 'default',
  multiline,
  autoFocus,
  maxLength,
  testID,
}: TextFieldProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.colors.danger : focused ? t.colors.focus : t.colors.borderDefault;
  return (
    <View style={{ gap: t.space.xs, alignSelf: 'stretch' }}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? t.size.control.lg * 2 : t.size.control.md,
          paddingHorizontal: t.space.lg,
          borderRadius: t.radius.md,
          borderWidth: focused || error ? t.size.focusRing : t.size.hairline,
          borderColor,
          backgroundColor: t.colors.surface,
        }}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textTertiary}
          keyboardType={keyboardMap[keyboard]}
          multiline={multiline}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          style={{
            flex: 1,
            color: t.colors.textPrimary,
            fontSize: t.typography.body.fontSize,
            paddingVertical: t.space.md,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
        {suffix ? (
          <Text variant="label" color="textSecondary">
            {suffix}
          </Text>
        ) : null}
      </View>
      {error || helper ? (
        <Text variant="caption" color={error ? 'danger' : 'textTertiary'}>
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
}
