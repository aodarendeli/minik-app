import { createContext, use, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme, type PaletteName, type Theme, type ThemePreference } from './theme';

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({
  preference,
  palette = 'mint',
  children,
}: {
  preference: ThemePreference;
  palette?: PaletteName;
  children: ReactNode;
}) {
  const scheme = useColorScheme();
  const name = preference === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => buildTheme(name, palette), [name, palette]);
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  return use(ThemeContext);
}
