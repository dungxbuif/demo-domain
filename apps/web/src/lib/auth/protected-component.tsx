'use client';

import { ReactNode } from 'react';
import { useUserRole } from './auth-context';
import { hasPermission, Permission, UserRole } from './permissions';

interface ProtectedComponentProps {
  children: ReactNode;
  permission?: Permission;
  roles?: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function ProtectedComponent({
  children,
  permission,
  roles,
  fallback = null,
  requireAll = false,
}: ProtectedComponentProps) {
  const userRole = useUserRole();

  // Create permission object if roles array is provided
  const permissionToCheck =
    permission || (roles ? { roles, requireAll } : null);

  if (!permissionToCheck) {
    // No permission specified, render children
    return <>{children}</>;
  }

  const hasAccess = hasPermission(userRole, permissionToCheck);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
}

/**
 * Component that requires minimum role level
 */
export function RequireRole({
  children,
  role,
  fallback = null,
}: RequireRoleProps) {
  const userRole = useUserRole();

  if (userRole === null || userRole < role) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAnyRoleProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that requires any of the specified roles
 */
export function RequireAnyRole({
  children,
  roles,
  fallback = null,
}: RequireAnyRoleProps) {
  return (
    <ProtectedComponent permission={{ roles }} fallback={fallback}>
      {children}
    </ProtectedComponent>
  );
}
