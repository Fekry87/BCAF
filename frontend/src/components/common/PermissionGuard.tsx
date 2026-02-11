import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission, UserRole } from '@/types';

interface PermissionGuardProps {
  children: ReactNode;
  /** Required permission(s) - user must have at least one */
  permissions?: Permission | Permission[];
  /** Required role(s) - user must have at least one */
  roles?: UserRole | UserRole[];
  /** If true, user must have ALL permissions (default: false - any permission) */
  requireAll?: boolean;
  /** What to render if permission denied (default: null - hide element) */
  fallback?: ReactNode;
  /** Redirect path for routes (only use for route-level guards) */
  redirectTo?: string;
}

/**
 * Guard component to conditionally render children based on user permissions
 *
 * Usage:
 * ```tsx
 * // Hide element if no permission
 * <PermissionGuard permissions="content:delete">
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * // Show fallback if no permission
 * <PermissionGuard permissions="settings:write" fallback={<p>No access</p>}>
 *   <SettingsPanel />
 * </PermissionGuard>
 *
 * // Redirect if no permission (for routes)
 * <PermissionGuard permissions="users:read" redirectTo="/admin">
 *   <UsersPage />
 * </PermissionGuard>
 *
 * // Require role
 * <PermissionGuard roles={['super_admin', 'admin']}>
 *   <AdminPanel />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permissions,
  roles,
  requireAll = false,
  fallback = null,
  redirectTo,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permissions) {
    const permissionList = Array.isArray(permissions) ? permissions : [permissions];

    if (requireAll) {
      hasAccess = hasAllPermissions(permissionList);
    } else {
      hasAccess = hasAnyPermission(permissionList);
    }
  }

  // Check roles (if permissions passed, both must be satisfied)
  if (roles && hasAccess) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    hasAccess = hasAnyRole(roleList);
  }

  // If no permissions or roles specified, allow access
  if (!permissions && !roles) {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook-based permission check for programmatic usage
 */
export function usePermissionCheck(
  permissions?: Permission | Permission[],
  roles?: UserRole | UserRole[],
  requireAll = false
): boolean {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  let hasAccess = true;

  if (permissions) {
    const permissionList = Array.isArray(permissions) ? permissions : [permissions];
    hasAccess = requireAll ? hasAllPermissions(permissionList) : hasAnyPermission(permissionList);
  }

  if (roles && hasAccess) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    hasAccess = hasAnyRole(roleList);
  }

  return hasAccess;
}
