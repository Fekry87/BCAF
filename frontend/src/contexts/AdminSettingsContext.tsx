import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

interface AdminThemeConfig {
  theme_mode: 'dark' | 'light' | 'system';
  accent_color: string;
  sidebar_style: 'default' | 'compact' | 'expanded';
  primary_color: string;
  secondary_color: string;
  dashboard_name: string;
  dashboard_logo: string;
  show_logo: boolean;
}

interface AdminSettingsContextType {
  settings: AdminThemeConfig;
  isLoading: boolean;
  refetch: () => void;
}

const defaultSettings: AdminThemeConfig = {
  theme_mode: 'dark',
  accent_color: '#3b82f6',
  sidebar_style: 'default',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6',
  dashboard_name: 'Admin',
  dashboard_logo: '',
  show_logo: true,
};

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

// Apply CSS variables to the document
function applyAdminTheme(settings: AdminThemeConfig) {
  const root = document.documentElement;

  // Apply accent color as CSS variable
  root.style.setProperty('--admin-accent-color', settings.accent_color);
  root.style.setProperty('--admin-primary-color', settings.primary_color);
  root.style.setProperty('--admin-secondary-color', settings.secondary_color);

  // Calculate lighter/darker variants
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };

  const rgb = hexToRgb(settings.accent_color);
  root.style.setProperty('--admin-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminThemeConfig>(defaultSettings);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: () => get<AdminThemeConfig>('/admin/system-settings'),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on auth failure
  });

  useEffect(() => {
    if (data?.data) {
      const mergedSettings = { ...defaultSettings, ...data.data };
      setSettings(mergedSettings);
      applyAdminTheme(mergedSettings);
    } else {
      applyAdminTheme(defaultSettings);
    }
  }, [data]);

  return (
    <AdminSettingsContext.Provider value={{ settings, isLoading, refetch }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (context === undefined) {
    throw new Error('useAdminSettings must be used within an AdminSettingsProvider');
  }
  return context;
}

export { defaultSettings as defaultAdminSettings };
