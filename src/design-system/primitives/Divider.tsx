import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

/** Hairline separator; with `label` renders "──── or ────". */
export function Divider({ label }: { label?: string }) {
  const t = useTheme();
  const base = { height: t.size.hairline, backgroundColor: t.colors.borderSubtle };
  // In a row, `stretch` would make the line full-height; a labeled line grows horizontally instead.
  const line = <View style={label ? { ...base, flex: 1 } : { ...base, alignSelf: 'stretch' }} />;
  if (!label) return line;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
      {line}
      <Text variant="caption" color="textTertiary">
        {label}
      </Text>
      {line}
    </View>
  );
}
