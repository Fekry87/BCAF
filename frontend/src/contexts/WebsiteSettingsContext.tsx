import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/api';

interface PageVisibility {
  home: boolean;
  about: boolean;
  contact: boolean;
  checkout: boolean;
}

interface WebsiteSettings {
  page_visibility: PageVisibility;
  maintenance_mode: boolean;
  maintenance_message: string;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings;
  isLoading: boolean;
  isPageVisible: (page: keyof PageVisibility) => boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultSettings: WebsiteSettings = {
  page_visibility: {
    home: true,
    about: true,
    contact: true,
    checkout: true,
  },
  maintenance_mode: false,
  maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
};

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType | undefined>(undefined);

export function WebsiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['website-settings'],
    queryFn: () => get<WebsiteSettings>('/website-settings'),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });

  const settings = data?.data || defaultSettings;

  const isPageVisible = (page: keyof PageVisibility): boolean => {
    return settings.page_visibility?.[page] ?? true;
  };

  const isMaintenanceMode = settings.maintenance_mode ?? false;
  const maintenanceMessage = settings.maintenance_message || defaultSettings.maintenance_message;

  return (
    <WebsiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        isPageVisible,
        isMaintenanceMode,
        maintenanceMessage,
      }}
    >
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);
  if (context === undefined) {
    throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
  }
  return context;
}
