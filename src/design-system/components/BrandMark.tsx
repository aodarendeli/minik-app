import { Image, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

// 240×240 PNG, ~6 KB (see docs/DECISIONS.md, 2026-11-14).
const MARK = require('../../../assets/images/brand-mark.png') as number;

/** The Minik face on a soft brand halo with two decorative rings. Decorative: hidden from screen readers. */
export function BrandMark() {
  const t = useTheme();
  const size = t.size.avatar.lg * 2;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: t.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors.brandSoft,
        borderWidth: t.space.sm,
        borderColor: t.colors.surface,
        boxShadow: `${t.elevation.md} ${t.colors.shadow}`,
      }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: t.radius.pill,
          backgroundColor: t.colors.brand,
          opacity: 0.18,
        }}
      />
      <Image source={MARK} style={{ width: size * 0.78, height: size * 0.78 }} />
    </View>
  );
}
