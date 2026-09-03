import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_MODE_KEY = 'themeMode';

// This type must stay in sync with the ThemeMode in ThemeProvider.tsx.
export type ThemePersistenceMode = 'system' | 'light' | 'dark';

export const THEME_MODES: ThemePersistenceMode[] = ['system', 'light', 'dark'];

export const getSavedThemeMode = async (): Promise<ThemePersistenceMode | null> => {
  try {
    const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored as ThemePersistenceMode;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveThemeMode = async (mode: ThemePersistenceMode): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  } catch {
    // Silently fail persistence; the in-memory value still works this session.
  }
};
