import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type ScreenContainerProps = {
  children: ReactNode;
  /** Large in-content title (tab screens). Omit on screens with a native header. */
  title?: string;
  subtitle?: string;
  /** Slot rendered on the end side of the title row. */
  headerAccessory?: ReactNode;
  /** Sticky bottom area, e.g. a primary Save button. */
  footer?: ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({ children, title, subtitle, headerAccessory, footer, scroll = true }: ScreenContainerProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={{
        width: '100%',
        maxWidth: t.size.contentMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: t.space.lg,
        paddingTop: title ? insets.top + t.space.lg : t.space.lg,
        paddingBottom: footer ? t.space.lg : t.space.huge + t.space.xxxl,
        gap: t.space.xl,
      }}>
      {title ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <View style={{ flex: 1, gap: t.space.xxs }}>
            <Text variant="display" accessibilityRole="header" numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? <Text color="textSecondary">{subtitle}</Text> : null}
          </View>
          {headerAccessory}
        </View>
      ) : null}
      {children}
    </View>
  );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? (
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{content}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: t.space.lg,
            paddingTop: t.space.md,
            paddingBottom: insets.bottom + t.space.md,
            borderTopWidth: t.size.hairline,
            borderTopColor: t.colors.borderSubtle,
            backgroundColor: t.colors.surface,
            gap: t.space.sm,
          }}>
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
