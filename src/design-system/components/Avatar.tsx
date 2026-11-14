import { Image, View } from 'react-native';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';
import { tones, type Tone } from '@minik/design-tokens';

export type AvatarProps = {
  name: string;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  /** Surface-colored ring, for avatars on tinted backgrounds. */
  ring?: boolean;
  /** Show the Minik baby face on the tone color instead of initials. */
  face?: boolean;
};

// Shared with BrandMark: 240×240 PNG, ~6 KB.
const FACE = require('../../../assets/images/brand-mark.png') as number;

export function Avatar({ name, tone = 'brand', size = 'md', ring, face }: AvatarProps) {
  const t = useTheme();
  const px = t.size.avatar[size];
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toLocaleUpperCase())
    .join('');
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: px,
        height: px,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors[tones[tone].solid],
        overflow: 'hidden',
        borderWidth: ring ? t.size.focusRing * 2 : 0,
        borderColor: t.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {face ? (
        <Image source={FACE} style={{ width: px * 0.9, height: px * 0.9 }} />
      ) : (
        <Text variant={size === 'lg' ? 'title1' : 'label'} color={tones[tone].onSolid} capScale>
          {initials}
        </Text>
      )}
    </View>
  );
}
