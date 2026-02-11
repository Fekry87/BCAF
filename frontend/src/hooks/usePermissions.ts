import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission, UserRole } from '@/types';

/**
 * Hook to check user permissions and roles
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!isAuthenticated || !user) return false;
      return user.permissions?.includes(permission) ?? false;
    },
    [isAuthenticated, user]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!isAuthenticated || !user) return false;
      return permissions.some((p) => user.permissions?.includes(p));
    },
    [isAuthenticated, user]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!isAuthenticated || !user) return false;
      return permissions.every((p) => user.permissions?.includes(p));
    },
    [isAuthenticated, user]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!isAuthenticated || !user) return false;
      return user.role === role;
    },
    [isAuthenticated, user]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!isAuthenticated || !user) return false;
      return user.role ? roles.includes(user.role) : false;
    },
    [isAuthenticated, user]
  );

  /**
   * Check if user is a super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    return hasRole('super_admin');
  }, [hasRole]);

  /**
   * Check if user is an admin (super_admin or admin)
   */
  const isAdmin = useCallback((): boolean => {
    return hasAnyRole(['super_admin', 'admin']);
  }, [hasAnyRole]);

  /**
   * Check if user can read content
   */
  const canReadContent = useCallback((): boolean => {
    return hasPermission('content:read');
  }, [hasPermission]);

  /**
   * Check if user can write content
   */
  const canWriteContent = useCallback((): boolean => {
    return hasPermission('content:write');
  }, [hasPermission]);

  /**
   * Check if user can delete content
   */
  const canDeleteContent = useCallback((): boolean => {
    return hasPermission('content:delete');
  }, [hasPermission]);

  /**
   * Check if user can manage users
   */
  const canManageUsers = useCallback((): boolean => {
    return hasPermission('users:write');
  }, [hasPermission]);

  /**
   * Check if user can manage integrations
   */
  const canManageIntegrations = useCallback((): boolean => {
    return hasPermission('integrations:write');
  }, [hasPermission]);

  /**
   * Check if user can manage settings
   */
  const canManageSettings = useCallback((): boolean => {
    return hasPermission('settings:write');
  }, [hasPermission]);

  return {
    // Core permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,

    // Convenience methods
    isSuperAdmin,
    isAdmin,
    canReadContent,
    canWriteContent,
    canDeleteContent,
    canManageUsers,
    canManageIntegrations,
    canManageSettings,

    // User info
    userRole: user?.role,
    userPermissions: user?.permissions ?? [],
  };
}
