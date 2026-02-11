import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme, applyThemeToDOM, defaultTheme } from './ThemeContext';

// Mock the API
vi.mock('@/services/api', () => ({
  get: vi.fn(),
}));

import { get } from '@/services/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
};

// Test component to access theme context
function TestComponent() {
  const { theme, isLoading, updateTheme, refetchTheme } = useTheme();

  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="primary-900">{theme.primary_900}</span>
      <span data-testid="font-heading">{theme.font_heading}</span>
      <button onClick={() => updateTheme({ primary_900: '#ff0000' })}>Update Theme</button>
      <button onClick={refetchTheme}>Refetch</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM styles
    document.documentElement.style.cssText = '';
  });

  describe('ThemeProvider', () => {
    it('should provide default theme initially', async () => {
      vi.mocked(get).mockResolvedValue({ success: true, data: null });

      render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('primary-900').textContent).toBe(defaultTheme.primary_900);
      });
    });

    it('should merge API theme with defaults', async () => {
      vi.mocked(get).mockResolvedValue({
        success: true,
        data: { primary_900: '#123456' },
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('primary-900').textContent).toBe('#123456');
      });
    });

    it('should apply theme to DOM', async () => {
      vi.mocked(get).mockResolvedValue({
        success: true,
        data: { primary_900: '#abcdef' },
      });

      render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        const root = document.documentElement;
        expect(root.style.getPropertyValue('--color-primary-900')).toBe('#abcdef');
      });
    });
  });

  describe('updateTheme', () => {
    it('should update theme immediately', async () => {
      vi.mocked(get).mockResolvedValue({ success: true, data: null });

      render(<TestComponent />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // Click update button
      screen.getByText('Update Theme').click();

      await waitFor(() => {
        expect(screen.getByTestId('primary-900').textContent).toBe('#ff0000');
      });
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleError.mockRestore();
    });
  });
});

describe('applyThemeToDOM', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
  });

  it('should apply all theme properties to CSS variables', () => {
    applyThemeToDOM(defaultTheme);

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary-900')).toBe(defaultTheme.primary_900);
    expect(root.style.getPropertyValue('--color-primary-800')).toBe(defaultTheme.primary_800);
    expect(root.style.getPropertyValue('--color-text-heading')).toBe(defaultTheme.text_heading);
    expect(root.style.getPropertyValue('--color-accent-yellow')).toBe(defaultTheme.accent_yellow);
    expect(root.style.getPropertyValue('--font-heading')).toBe(defaultTheme.font_heading);
    expect(root.style.getPropertyValue('--font-body')).toBe(defaultTheme.font_body);
    expect(root.style.getPropertyValue('--radius-md')).toBe(defaultTheme.border_radius);
  });

  it('should merge partial theme with defaults', () => {
    applyThemeToDOM({ primary_900: '#custom' });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-primary-900')).toBe('#custom');
    // Other values should be defaults
    expect(root.style.getPropertyValue('--color-primary-800')).toBe(defaultTheme.primary_800);
  });
});

describe('defaultTheme', () => {
  it('should have all required properties', () => {
    expect(defaultTheme).toHaveProperty('primary_900');
    expect(defaultTheme).toHaveProperty('primary_800');
    expect(defaultTheme).toHaveProperty('primary_700');
    expect(defaultTheme).toHaveProperty('primary_500');
    expect(defaultTheme).toHaveProperty('primary_100');
    expect(defaultTheme).toHaveProperty('primary_50');
    expect(defaultTheme).toHaveProperty('text_heading');
    expect(defaultTheme).toHaveProperty('text_subheading');
    expect(defaultTheme).toHaveProperty('text_body');
    expect(defaultTheme).toHaveProperty('text_muted');
    expect(defaultTheme).toHaveProperty('accent_yellow');
    expect(defaultTheme).toHaveProperty('cta_primary_bg');
    expect(defaultTheme).toHaveProperty('font_heading');
    expect(defaultTheme).toHaveProperty('font_body');
    expect(defaultTheme).toHaveProperty('border_radius');
  });

  it('should have valid color values', () => {
    const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
    expect(defaultTheme.primary_900).toMatch(hexColorRegex);
    expect(defaultTheme.primary_800).toMatch(hexColorRegex);
    expect(defaultTheme.accent_yellow).toMatch(hexColorRegex);
  });
});
