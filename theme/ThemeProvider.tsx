import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTokens } from './colors';
import { typography, TypographyTokens, fontFamily } from './typography';
import { spacing, SpacingTokens } from './spacing';
import { radii, RadiiTokens } from './radii';
import { getSavedThemeMode, saveThemeMode } from './storage';

export interface Theme {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radii: RadiiTokens;
  fontFamily: string;
  colorScheme: 'light' | 'dark';
}

export const lightTheme: Theme = {
  colors: lightColors,
  typography,
  spacing,
  radii,
  fontFamily,
  colorScheme: 'light',
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  radii,
  fontFamily,
  colorScheme: 'dark',
};

export type ThemeMode = 'system' | 'light' | 'dark';

// Context exposes the current theme and a function to change the mode.
export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // On mount, load the persisted theme preference if one was saved.
  useEffect(() => {
    let isMounted = true;
    getSavedThemeMode().then((saved) => {
      if (isMounted && saved !== null) {
        setModeState(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    await saveThemeMode(newMode);
    setModeState(newMode);
  };

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const theme = useMemo<Theme>(
    () => (resolvedMode === 'dark' ? darkTheme : lightTheme),
    [resolvedMode]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, setMode }),
    [theme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx.theme;
};

const useThemeMode = (): { mode: ThemeMode; setMode: (mode: ThemeMode) => Promise<void> } => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return { mode: ctx.mode, setMode: ctx.setMode };
};

export { ThemeProvider, useTheme, useThemeMode };
