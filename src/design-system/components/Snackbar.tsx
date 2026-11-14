import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives/Text';
import { useTheme } from '../theme/ThemeProvider';

export type SnackbarMessage = { message: string; action?: { label: string; onPress: () => void } };

type SnackbarApi = { show: (msg: SnackbarMessage) => void };

const SnackbarContext = createContext<SnackbarApi>({ show: () => undefined });
const VISIBLE_MS = 5000;

/** Hosts one transient message at a time (e.g. "Deleted · Undo"). */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const show = (msg: SnackbarMessage) => {
    if (timer.current) clearTimeout(timer.current);
    setCurrent(msg);
    timer.current = setTimeout(() => setCurrent(null), VISIBLE_MS);
  };
  const dismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    setCurrent(null);
  };
  return (
    <SnackbarContext value={{ show }}>
      {children}
      {current ? <SnackbarView msg={current} onDismiss={dismiss} /> : null}
    </SnackbarContext>
  );
}

export function useSnackbar(): SnackbarApi {
  return use(SnackbarContext);
}

function SnackbarView({ msg, onDismiss }: { msg: SnackbarMessage; onDismiss: () => void }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        left: t.space.lg,
        right: t.space.lg,
        bottom: insets.bottom + t.size.control.lg + t.space.xl,
        zIndex: t.zIndex.toast,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.md,
        paddingStart: t.space.lg,
        paddingEnd: t.space.xs,
        minHeight: t.size.control.lg,
        borderRadius: t.radius.md,
        backgroundColor: t.colors.textPrimary,
      }}>
      <View style={{ flex: 1 }}>
        <Text variant="label" color="textInverse">
          {msg.message}
        </Text>
      </View>
      {msg.action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={msg.action.label}
          onPress={() => {
            msg.action?.onPress();
            onDismiss();
          }}
          style={{ minHeight: t.size.touchTarget, justifyContent: 'center', paddingHorizontal: t.space.md }}>
          <Text variant="label" color="brandSoft" uppercase>
            {msg.action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
