import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '@/services/api';

export interface ThemeConfig {
  // Background Colors
  primary_900: string;  // Dark backgrounds (hero, dark sections)
  primary_800: string;  // Secondary dark backgrounds
  primary_700: string;  // Headers, navigation
  primary_500: string;  // Borders, dividers
  primary_100: string;  // Cards, panels
  primary_50: string;   // Page background

  // Text Colors
  text_heading: string;    // Main headings (H1)
  text_subheading: string; // Subheadings (H2-H3)
  text_body: string;       // Body text, paragraphs
  text_muted: string;      // Captions, placeholders
  text_link_hover: string; // Link hover state
  primary_600: string;     // Keep for backward compatibility
  primary_400: string;     // Keep for backward compatibility

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
  // Background Colors
  primary_900: '#2c4a6e',  // Dark backgrounds (hero, dark sections)
  primary_800: '#3a5a7c',  // Secondary dark backgrounds
  primary_700: '#4a6a8c',  // Headers, navigation
  primary_500: '#d1d5db',  // Borders, dividers
  primary_100: '#ffffff',  // Cards, panels
  primary_50: '#f8fafc',   // Page background

  // Text Colors
  text_heading: '#1a1a2e',    // Main headings - dark text
  text_subheading: '#2d2d44', // Subheadings
  text_body: '#4a4a5a',       // Body text
  text_muted: '#9ca3af',      // Captions, placeholders
  text_link_hover: '#2563eb', // Link hover
  primary_600: '#2563a8',     // Backward compatibility
  primary_400: '#9ca3af',     // Backward compatibility

  // Accent Colors
  accent_yellow: '#f4c430',
  accent_yellow_light: '#fef9e7',

  // CTA Colors
  cta_primary_bg: '#f4c430',
  cta_primary_text: '#1a1a2e',
  cta_primary_hover: '#e6b62d',

  // Typography
  font_heading: '"Source Serif 4", Georgia, serif',
  font_body: 'Inter, -apple-system, sans-serif',

  // Border Radius
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
export function applyThemeToDOM(theme: Partial<ThemeConfig>) {
  const root = document.documentElement;

  // Merge with defaults to ensure all values are present
  const fullTheme = { ...defaultTheme, ...theme };

  // Apply background colors
  root.style.setProperty('--color-primary-900', fullTheme.primary_900);
  root.style.setProperty('--color-primary-800', fullTheme.primary_800);
  root.style.setProperty('--color-primary-700', fullTheme.primary_700);
  root.style.setProperty('--color-primary-600', fullTheme.primary_600);
  root.style.setProperty('--color-primary-500', fullTheme.primary_500);
  root.style.setProperty('--color-primary-400', fullTheme.primary_400);
  root.style.setProperty('--color-primary-100', fullTheme.primary_100);
  root.style.setProperty('--color-primary-50', fullTheme.primary_50);

  // Apply text colors
  root.style.setProperty('--color-text-heading', fullTheme.text_heading);
  root.style.setProperty('--color-text-subheading', fullTheme.text_subheading);
  root.style.setProperty('--color-text-body', fullTheme.text_body);
  root.style.setProperty('--color-text-muted', fullTheme.text_muted);
  root.style.setProperty('--color-text-link-hover', fullTheme.text_link_hover);

  // Apply accent colors
  root.style.setProperty('--color-accent-yellow', fullTheme.accent_yellow);
  root.style.setProperty('--color-accent-yellow-light', fullTheme.accent_yellow_light);

  // Apply CTA colors
  root.style.setProperty('--color-cta-primary-bg', fullTheme.cta_primary_bg);
  root.style.setProperty('--color-cta-primary-text', fullTheme.cta_primary_text);
  root.style.setProperty('--color-cta-primary-hover', fullTheme.cta_primary_hover);

  // Apply typography
  root.style.setProperty('--font-heading', fullTheme.font_heading);
  root.style.setProperty('--font-body', fullTheme.font_body);

  // Apply border radius
  root.style.setProperty('--radius-md', fullTheme.border_radius);
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
