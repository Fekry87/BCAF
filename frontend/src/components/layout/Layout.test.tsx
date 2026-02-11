import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './Layout';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';

// Mock the child components
vi.mock('./Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('./Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('./SkipLink', () => ({
  SkipLink: () => <a data-testid="skip-link" href="#main-content">Skip to main content</a>,
}));

vi.mock('@/components/pages/MaintenancePage', () => ({
  MaintenancePage: () => <div data-testid="maintenance-page">Maintenance</div>,
}));

vi.mock('@/components/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">Not Found</div>,
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderLayout = (initialEntries = ['/']) => {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <WebsiteSettingsProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Layout />
        </MemoryRouter>
      </WebsiteSettingsProvider>
    </QueryClientProvider>
  );
};

describe('Layout', () => {
  describe('structure', () => {
    it('should render header', async () => {
      renderLayout();
      expect(await screen.findByTestId('header')).toBeInTheDocument();
    });

    it('should render footer', async () => {
      renderLayout();
      expect(await screen.findByTestId('footer')).toBeInTheDocument();
    });

    it('should render skip link for accessibility', async () => {
      renderLayout();
      expect(await screen.findByTestId('skip-link')).toBeInTheDocument();
    });

    it('should render main content area', async () => {
      renderLayout();
      expect(await screen.findByRole('main')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have main content with proper role', async () => {
      renderLayout();
      const main = await screen.findByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have main content with aria-label', async () => {
      renderLayout();
      const main = await screen.findByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Main content');
    });

    it('should have skip link pointing to main content', async () => {
      renderLayout();
      const skipLink = await screen.findByTestId('skip-link');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });
});
