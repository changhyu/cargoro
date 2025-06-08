'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    try {
      return (localStorage?.getItem(storageKey) as Theme) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window?.document?.documentElement;
    if (!root) return;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = getSystemTheme();
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage?.setItem(storageKey, theme);
        }
      } catch (e) {
        console.error('Failed to save theme to localStorage:', e);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// 브라우저 환경 및 테스트 환경 모두에서 작동하는 헬퍼 함수
function getSystemTheme(): Theme {
  // 테스트 환경에서는 항상 기본값 반환
  if (typeof window === 'undefined') {
    return 'light';
  }

  // matchMedia가 정의되지 않은 환경
  if (!window.matchMedia) {
    return 'light';
  }

  try {
    // 안전하게 matchMedia 접근
    const query = '(prefers-color-scheme: dark)';
    const mediaQuery = window.matchMedia(query);

    // mediaQuery 객체나 matches 속성이 없으면 기본값 반환
    if (!mediaQuery || typeof mediaQuery.matches !== 'boolean') {
      return 'light';
    }

    return mediaQuery.matches ? 'dark' : 'light';
  } catch (e) {
    console.error('Error accessing matchMedia:', e);
    return 'light';
  }
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
