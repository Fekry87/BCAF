import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });
    });

    it('should return false for hasPermission', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('content:read')).toBe(false);
    });

    it('should return false for hasRole', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasRole('admin')).toBe(false);
    });

    it('should return false for isSuperAdmin', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isSuperAdmin()).toBe(false);
    });

    it('should return empty permissions array', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.userPermissions).toEqual([]);
    });
  });

  describe('when user is authenticated with permissions', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          permissions: ['content:read', 'content:write', 'orders:read'],
        },
        isAuthenticated: true,
      });
    });

    it('should return true for permissions user has', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('content:read')).toBe(true);
      expect(result.current.hasPermission('content:write')).toBe(true);
    });

    it('should return false for permissions user does not have', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('content:delete')).toBe(false);
      expect(result.current.hasPermission('users:write')).toBe(false);
    });

    it('should check hasAnyPermission correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyPermission(['content:read', 'users:write'])).toBe(true);
      expect(result.current.hasAnyPermission(['users:write', 'users:delete'])).toBe(false);
    });

    it('should check hasAllPermissions correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAllPermissions(['content:read', 'content:write'])).toBe(true);
      expect(result.current.hasAllPermissions(['content:read', 'users:write'])).toBe(false);
    });

    it('should return correct role', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('super_admin')).toBe(false);
    });

    it('should check hasAnyRole correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyRole(['admin', 'super_admin'])).toBe(true);
      expect(result.current.hasAnyRole(['super_admin', 'editor'])).toBe(false);
    });

    it('should return false for isSuperAdmin when role is admin', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isSuperAdmin()).toBe(false);
    });

    it('should return true for isAdmin when role is admin', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin()).toBe(true);
    });
  });

  describe('when user is super_admin', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Super Admin',
          email: 'super@test.com',
          role: 'super_admin',
          permissions: [
            'content:read',
            'content:write',
            'content:delete',
            'users:read',
            'users:write',
            'users:delete',
            'settings:read',
            'settings:write',
          ],
        },
        isAuthenticated: true,
      });
    });

    it('should return true for isSuperAdmin', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isSuperAdmin()).toBe(true);
    });

    it('should return true for isAdmin', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin()).toBe(true);
    });

    it('should return true for canManageSettings', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canManageSettings()).toBe(true);
    });

    it('should return true for canDeleteContent', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDeleteContent()).toBe(true);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Editor',
          email: 'editor@test.com',
          role: 'editor',
          permissions: ['content:read', 'content:write', 'orders:read'],
        },
        isAuthenticated: true,
      });
    });

    it('canReadContent should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canReadContent()).toBe(true);
    });

    it('canWriteContent should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canWriteContent()).toBe(true);
    });

    it('canDeleteContent should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDeleteContent()).toBe(false);
    });

    it('canManageUsers should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canManageUsers()).toBe(false);
    });
  });
});
