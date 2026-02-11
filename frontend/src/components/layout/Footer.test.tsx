import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Footer } from './Footer';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';

// Mock the API calls
vi.mock('@/services/pillars', () => ({
  pillarsApi: {
    getAll: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Business', slug: 'business', is_active: true },
        { id: 2, name: 'Education', slug: 'education', is_active: true },
      ],
    }),
  },
}));

vi.mock('@/services/api', () => ({
  get: vi.fn().mockImplementation((endpoint: string) => {
    if (endpoint === '/content/settings') {
      return Promise.resolve({
        success: true,
        data: {
          site_name: 'Test Consultancy',
          tagline: 'Expert guidance',
          email: 'test@example.com',
          phone: '+441234567890',
          address: '123 Test Street\nLondon, UK',
          linkedin_url: 'https://linkedin.com/test',
          twitter_url: 'https://twitter.com/test',
        },
      });
    }
    if (endpoint === '/content/footer') {
      return Promise.resolve({
        success: true,
        data: {
          brand_description: 'Test brand description',
          quick_links: [],
          legal_links: [
            { to: '/privacy', label: 'Privacy' },
            { to: '/terms', label: 'Terms' },
          ],
        },
      });
    }
    if (endpoint === '/content/website-settings') {
      return Promise.resolve({
        success: true,
        data: {
          pages: { home: true, about: true, contact: true },
          maintenance_mode: { enabled: false },
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
        <WebsiteSettingsProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </WebsiteSettingsProvider>
      </QueryClientProvider>
    );
  };
};

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render footer element with contentinfo role', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render the brand logo placeholder', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('should render Quick Links section', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
  });

  it('should render Contact Us section', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('should render Connect section', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('should render default navigation links', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('should render About Us link', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByRole('link', { name: 'About Us' })).toBeInTheDocument();
  });

  it('should render Contact link', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('should render social media links', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
  });

  it('should render copyright with current year', () => {
    render(<Footer />, { wrapper: createWrapper() });
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('should render default legal links', () => {
    render(<Footer />, { wrapper: createWrapper() });
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });
});
