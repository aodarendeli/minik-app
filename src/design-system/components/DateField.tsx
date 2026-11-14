import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { IconButton } from './IconButton';

/** ISO calendar date `YYYY-MM-DD`. */
type IsoDate = string;

function toDmy(iso: IsoDate): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function fromDmy(text: string): IsoDate | null {
  const match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (date.getUTCDate() !== Number(d) || date.getUTCMonth() !== Number(m) - 1) return null;
  return date.toISOString().slice(0, 10);
}

function shift(iso: IsoDate, days: number): IsoDate {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export type DateFieldProps = {
  label: string;
  value: IsoDate;
  onChange: (value: IsoDate) => void;
  /** Human-readable rendering of the value, e.g. "12 Kasım 2026". */
  formatValue: (value: IsoDate) => string;
  max?: IsoDate;
  /** Earliest selectable date (inclusive). */
  min?: IsoDate;
  previousLabel: string;
  nextLabel: string;
  invalidLabel: string;
};

/** Date input: type DD.MM.YYYY or step by day. No native picker dependency. */
export function DateField({ label, value, onChange, formatValue, min, max, previousLabel, nextLabel, invalidLabel }: DateFieldProps) {
  const t = useTheme();
  const [text, setText] = useState(toDmy(value));
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setText(toDmy(value));
  }
  const parsed = fromDmy(text);
  const invalid = parsed === null || (max !== undefined && parsed > max) || (min !== undefined && parsed < min);
  const clamp = (d: IsoDate) => (max !== undefined && d > max ? max : min !== undefined && d < min ? min : d);
  const commit = (next: IsoDate) => onChange(clamp(next));
  return (
    <View style={{ gap: t.space.xs }}>
      <Text variant="label" color="textSecondary">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: t.radius.md,
          borderWidth: invalid ? t.size.focusRing : t.size.hairline,
          borderColor: invalid ? t.colors.danger : t.colors.borderDefault,
          backgroundColor: t.colors.surface,
          paddingHorizontal: t.space.xs,
        }}>
        <IconButton
          icon="back"
          label={previousLabel}
          onPress={() => commit(shift(value, -1))}
          disabled={min !== undefined && value <= min}
        />
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(next);
            const iso = fromDmy(next);
            if (iso && (max === undefined || iso <= max) && (min === undefined || iso >= min)) onChange(iso);
          }}
          keyboardType="numbers-and-punctuation"
          accessibilityLabel={label}
          placeholder="GG.AA.YYYY"
          placeholderTextColor={t.colors.textTertiary}
          style={{
            flex: 1,
            textAlign: 'center',
            color: t.colors.textPrimary,
            fontSize: t.typography.bodyStrong.fontSize,
            fontWeight: t.typography.bodyStrong.fontWeight,
            minHeight: t.size.control.md,
          }}
        />
        <IconButton
          icon="forward"
          label={nextLabel}
          onPress={() => commit(shift(value, 1))}
          disabled={max !== undefined && value >= max}
        />
      </View>
      <Text variant="caption" color={invalid ? 'danger' : 'textTertiary'} align="center">
        {invalid ? invalidLabel : formatValue(value)}
      </Text>
    </View>
  );
}
