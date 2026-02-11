import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
  withAuth?: boolean;
  withTheme?: boolean;
  withRouter?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    withAuth = true,
    withTheme = true,
    withRouter = true,
    ...options
  }: CustomRenderOptions = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute);

  function Wrapper({ children }: WrapperProps) {
    let wrapped = children;

    // Apply providers from innermost to outermost
    if (withAuth) {
      wrapped = <AuthProvider>{wrapped}</AuthProvider>;
    }

    if (withTheme) {
      wrapped = <ThemeProvider>{wrapped}</ThemeProvider>;
    }

    wrapped = <QueryClientProvider client={queryClient}>{wrapped}</QueryClientProvider>;

    if (withRouter) {
      wrapped = <BrowserRouter>{wrapped}</BrowserRouter>;
    }

    return <>{wrapped}</>;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Export custom render as the default render
export { customRender as render };

// Export utility for creating query client
export { createTestQueryClient };

// Mock data factories
export const mockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin' as const,
  permissions: ['content:read', 'content:write'] as const,
  ...overrides,
});

export const mockPillar = (overrides = {}) => ({
  id: 1,
  name: 'Business Consultancy',
  slug: 'business-consultancy',
  tagline: 'Expert business guidance',
  description: 'Comprehensive business consultancy services',
  hero_image: null,
  card_image: null,
  meta_title: null,
  meta_description: null,
  sort_order: 1,
  is_active: true,
  services_count: 5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockService = (overrides = {}) => ({
  id: 1,
  pillar_id: 1,
  type: 'one_off' as const,
  type_label: 'One-off',
  title: 'Strategy Consultation',
  slug: 'strategy-consultation',
  summary: 'One-on-one strategy session',
  details: 'Detailed description of the service',
  icon: 'Lightbulb',
  icon_image: null,
  price_from: 500,
  price_label: 'From £500',
  sort_order: 1,
  is_featured: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockApiResponse = <T,>(data: T, message: string | null = null) => ({
  success: true,
  data,
  message,
  errors: null,
  meta: null,
});

export const mockApiError = (message: string, errors: Record<string, string[]> = {}) => ({
  success: false,
  data: null,
  message,
  errors,
  meta: null,
});
