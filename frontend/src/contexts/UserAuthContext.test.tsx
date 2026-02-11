import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserAuthProvider, useUserAuth } from './UserAuthContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access context
function TestComponent() {
  const {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    isAuthModalOpen,
    authModalMode,
    openSignIn,
    openSignUp,
    closeAuthModal,
  } = useUserAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="modal-open">{isAuthModalOpen.toString()}</span>
      <span data-testid="modal-mode">{authModalMode}</span>
      <button onClick={openSignIn}>Open Sign In</button>
      <button onClick={openSignUp}>Open Sign Up</button>
      <button onClick={closeAuthModal}>Close Modal</button>
      <button onClick={() => signIn('test@example.com', 'password123')}>Sign In</button>
      <button
        onClick={() =>
          signUp({
            email: 'new@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
          })
        }
      >
        Sign Up
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('UserAuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state when no token', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: false }) });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      // Initially loading
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('should load user from token on mount', async () => {
      // Mock getItem to return a token
      localStorageMock.getItem.mockReturnValue('valid-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('should handle invalid token on mount', async () => {
      // Mock getItem to return an invalid token
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Unauthenticated' }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      // Token is cleared on invalid response
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: {
              id: 1,
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
            },
            token: 'new-token',
          },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_auth_token', 'new-token');
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('should handle sign in failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Invalid credentials',
          errors: { email: ['Invalid email or password'] },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      });
    });

    it('should handle network errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      });
    });
  });

  describe('Sign Up', () => {
    it('should sign up successfully', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: {
              id: 2,
              email: 'new@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
            token: 'signup-token',
          },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign Up'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_auth_token', 'signup-token');
      expect(screen.getByTestId('user').textContent).toBe('new@example.com');
    });

    it('should handle duplicate email error', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Validation failed',
          errors: { email: ['An account with this email already exists'] },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Sign Up'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      });
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      const user = userEvent.setup();

      // First sign in to have a user
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User' },
            token: 'test-token',
          },
        }),
      });

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      // Sign in first
      await user.click(screen.getByText('Sign In'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      });

      // Now sign out
      await user.click(screen.getByText('Sign Out'));

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_auth_token');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('Modal Controls', () => {
    it('should open sign in modal', async () => {
      const user = userEvent.setup();

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('modal-open').textContent).toBe('false');

      await user.click(screen.getByText('Open Sign In'));

      expect(screen.getByTestId('modal-open').textContent).toBe('true');
      expect(screen.getByTestId('modal-mode').textContent).toBe('signin');
    });

    it('should open sign up modal', async () => {
      const user = userEvent.setup();

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Open Sign Up'));

      expect(screen.getByTestId('modal-open').textContent).toBe('true');
      expect(screen.getByTestId('modal-mode').textContent).toBe('signup');
    });

    it('should close modal', async () => {
      const user = userEvent.setup();

      render(
        <UserAuthProvider>
          <TestComponent />
        </UserAuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await user.click(screen.getByText('Open Sign In'));
      expect(screen.getByTestId('modal-open').textContent).toBe('true');

      await user.click(screen.getByText('Close Modal'));
      expect(screen.getByTestId('modal-open').textContent).toBe('false');
    });
  });

  describe('useUserAuth hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useUserAuth must be used within a UserAuthProvider');

      consoleError.mockRestore();
    });
  });
});
