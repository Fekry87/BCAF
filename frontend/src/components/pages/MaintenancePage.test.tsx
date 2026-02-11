import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaintenancePage } from './MaintenancePage';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';

// Mock the API calls
vi.mock('@/services/api', () => ({
  get: vi.fn().mockImplementation((endpoint: string) => {
    if (endpoint === '/content/website-settings') {
      return Promise.resolve({
        success: true,
        data: {
          pages: { home: true, about: true, contact: true },
          maintenance_mode: {
            enabled: true,
            message: 'We are currently performing scheduled maintenance. Please check back soon.',
          },
        },
      });
    }
    return Promise.resolve({ success: true, data: null });
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <WebsiteSettingsProvider>{children}</WebsiteSettingsProvider>
      </QueryClientProvider>
    );
  };
};

describe('MaintenancePage', () => {
  it('should render maintenance heading', () => {
    render(<MaintenancePage />, { wrapper: createWrapper() });

    expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
  });

  it('should render settings icon', () => {
    render(<MaintenancePage />, { wrapper: createWrapper() });

    // The Settings icon is rendered as an SVG
    const icon = document.querySelector('.lucide-settings');
    expect(icon).toBeInTheDocument();
  });

  it('should render decorative element', () => {
    const { container } = render(<MaintenancePage />, { wrapper: createWrapper() });

    // Check for the decorative accent bar
    const accentBar = container.querySelector('.bg-accent-yellow.rounded-full');
    expect(accentBar).toBeInTheDocument();
  });
});
