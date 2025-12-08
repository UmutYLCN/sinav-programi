import * as React from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'light',
  setTheme: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const getPreferredTheme = (key: string, defaultTheme: Theme) => {
  if (typeof window === 'undefined') return defaultTheme;
  const stored = window.localStorage.getItem(key) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return defaultTheme;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'sinav-programi-theme',
}) => {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getPreferredTheme(storageKey, defaultTheme),
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = React.useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

