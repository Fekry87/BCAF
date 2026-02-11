import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './Header';
import { WebsiteSettingsProvider } from '@/contexts/WebsiteSettingsContext';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { CartProvider } from '@/contexts/CartContext';

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
    if (endpoint === '/content/header') {
      return Promise.resolve({
        success: true,
        data: {
          logo_text: 'Test Logo',
          logo_image: null,
          nav_links: [],
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
  post: vi.fn(),
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
          <UserAuthProvider>
            <CartProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </CartProvider>
          </UserAuthProvider>
        </WebsiteSettingsProvider>
      </QueryClientProvider>
    );
  };
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render header element with banner role', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render main navigation', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('should render logo link to home', () => {
    render(<Header />, { wrapper: createWrapper() });
    const logoLinks = screen.getAllByRole('link');
    const homeLink = logoLinks.find(link => link.getAttribute('href') === '/');
    expect(homeLink).toBeInTheDocument();
  });

  it('should render Home nav links', () => {
    render(<Header />, { wrapper: createWrapper() });
    // Both desktop and mobile menus have Home links
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('should render About nav links', () => {
    render(<Header />, { wrapper: createWrapper() });
    // Both desktop and mobile menus have About links
    const aboutLinks = screen.getAllByRole('link', { name: 'About' });
    expect(aboutLinks.length).toBeGreaterThan(0);
  });

  it('should render Contact nav links', () => {
    render(<Header />, { wrapper: createWrapper() });
    // Both desktop and mobile menus have Contact links
    const contactLinks = screen.getAllByRole('link', { name: 'Contact' });
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('should render skip link', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should render Sign In buttons when not authenticated', () => {
    render(<Header />, { wrapper: createWrapper() });
    // There are both desktop and mobile Sign In buttons
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it('should render Sign Up buttons when not authenticated', () => {
    render(<Header />, { wrapper: createWrapper() });
    // There are both desktop and mobile Sign Up buttons
    const signUpButtons = screen.getAllByRole('button', { name: 'Sign Up' });
    expect(signUpButtons.length).toBeGreaterThan(0);
  });

  it('should render cart button', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /open cart/i })).toBeInTheDocument();
  });

  it('should render mobile menu toggle button', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('should toggle mobile menu when button clicked', () => {
    render(<Header />, { wrapper: createWrapper() });
    const menuButton = screen.getByRole('button', { name: /open menu/i });

    fireEvent.click(menuButton);

    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
  });

  it('should render logo placeholder when no image', () => {
    render(<Header />, { wrapper: createWrapper() });
    expect(screen.getByText('C')).toBeInTheDocument();
  });
});
