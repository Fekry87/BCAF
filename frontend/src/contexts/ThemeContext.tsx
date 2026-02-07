import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '@/services/api';

export interface ThemeConfig {
  // Primary Colors
  primary_900: string;
  primary_800: string;
  primary_700: string;
  primary_600: string;
  primary_500: string;
  primary_400: string;
  primary_100: string;
  primary_50: string;

  // Accent Colors
  accent_yellow: string;
  accent_yellow_light: string;

  // CTA Colors
  cta_primary_bg: string;
  cta_primary_text: string;
  cta_primary_hover: string;

  // Typography
  font_heading: string;
  font_body: string;

  // Border Radius
  border_radius: string;
}

const defaultTheme: ThemeConfig = {
  primary_900: '#0d2240',
  primary_800: '#133a6b',
  primary_700: '#1a4f8c',
  primary_600: '#2563a8',
  primary_500: '#3b82c4',
  primary_400: '#60a5e0',
  primary_100: '#e8f2fc',
  primary_50: '#f4f9fe',

  accent_yellow: '#f4c430',
  accent_yellow_light: '#fef9e7',

  cta_primary_bg: '#f4c430',
  cta_primary_text: '#0d2240',
  cta_primary_hover: '#e6b62d',

  font_heading: '"Source Serif 4", Georgia, serif',
  font_body: 'Inter, -apple-system, sans-serif',

  border_radius: '8px',
};

interface ThemeContextType {
  theme: ThemeConfig;
  isLoading: boolean;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  refetchTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Export this function so it can be used elsewhere
export function applyThemeToDOM(theme: ThemeConfig) {
  const root = document.documentElement;

  // Apply primary colors
  root.style.setProperty('--color-primary-900', theme.primary_900);
  root.style.setProperty('--color-primary-800', theme.primary_800);
  root.style.setProperty('--color-primary-700', theme.primary_700);
  root.style.setProperty('--color-primary-600', theme.primary_600);
  root.style.setProperty('--color-primary-500', theme.primary_500);
  root.style.setProperty('--color-primary-400', theme.primary_400);
  root.style.setProperty('--color-primary-100', theme.primary_100);
  root.style.setProperty('--color-primary-50', theme.primary_50);

  // Apply accent colors
  root.style.setProperty('--color-accent-yellow', theme.accent_yellow);
  root.style.setProperty('--color-accent-yellow-light', theme.accent_yellow_light);

  // Apply CTA colors
  root.style.setProperty('--color-cta-primary-bg', theme.cta_primary_bg);
  root.style.setProperty('--color-cta-primary-text', theme.cta_primary_text);
  root.style.setProperty('--color-cta-primary-hover', theme.cta_primary_hover);

  // Apply typography
  root.style.setProperty('--font-heading', theme.font_heading);
  root.style.setProperty('--font-body', theme.font_body);

  // Apply border radius
  root.style.setProperty('--radius-md', theme.border_radius);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['theme'],
    queryFn: () => get<ThemeConfig>('/content/theme'),
    staleTime: 0, // Always refetch to get latest theme
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data?.data) {
      const mergedTheme = { ...defaultTheme, ...data.data };
      setTheme(mergedTheme);
      applyThemeToDOM(mergedTheme);
    } else {
      applyThemeToDOM(defaultTheme);
    }
  }, [data]);

  // Function to update theme immediately (called from admin)
  const updateTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    const mergedTheme = { ...defaultTheme, ...theme, ...newTheme };
    setTheme(mergedTheme);
    applyThemeToDOM(mergedTheme);
    // Also update the query cache
    queryClient.setQueryData(['theme'], { data: mergedTheme });
  }, [theme, queryClient]);

  // Function to refetch theme from server
  const refetchTheme = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, updateTheme, refetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { defaultTheme };
