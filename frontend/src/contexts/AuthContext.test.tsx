import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '@/services/auth';
import type { User } from '@/types';

// Mock the auth service
vi.mock('@/services/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn(),
    refresh: vi.fn(),
  },
}));

const mockUser: User = {
  id: 1,
  email: 'admin@test.com',
  name: 'Admin User',
  role: 'admin',
  permissions: ['content:read', 'content:write'],
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no authenticated user
    vi.mocked(authApi.getUser).mockRejectedValue(new Error('Unauthorized'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should check authentication on mount', async () => {
      renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(authApi.getUser).toHaveBeenCalledTimes(1);
      });
    });

    it('should set authenticated state when user is found', async () => {
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should set unauthenticated state when no user found', async () => {
      vi.mocked(authApi.getUser).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      vi.mocked(authApi.login).mockResolvedValue({
        success: true,
        data: { user: mockUser, token: 'test-token' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'admin@test.com',
          password: 'password',
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'password',
      });
    });

    it('should throw error on failed login', async () => {
      const loginError = new Error('Invalid credentials');
      vi.mocked(authApi.login).mockRejectedValue(loginError);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login({
            email: 'admin@test.com',
            password: 'wrong',
          });
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear state', async () => {
      // Start authenticated
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });
      vi.mocked(authApi.logout).mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(authApi.logout).toHaveBeenCalled();
    });

    it('should clear state even if logout API fails', async () => {
      // Start authenticated
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // The logout function uses try/finally, which re-throws after finally
      // We need to catch the error while still allowing finally to run
      await act(async () => {
        try {
          await result.current.logout();
        } catch {
          // Expected - error is re-thrown after finally block runs
        }
      });

      // Should still clear local state due to finally block
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token when authenticated', async () => {
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });
      vi.mocked(authApi.refresh).mockResolvedValue({
        success: true,
        data: { token: 'new-token' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(authApi.refresh).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should not refresh when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(authApi.refresh).not.toHaveBeenCalled();
    });

    it('should logout when refresh fails', async () => {
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });
      vi.mocked(authApi.refresh).mockRejectedValue(new Error('Token expired'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('token state', () => {
    it('should have null token since HttpOnly cookies are used', async () => {
      vi.mocked(authApi.getUser).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Token should always be null as it's in HttpOnly cookie
      expect(result.current.token).toBeNull();
    });
  });
});
