export enum UserRole {
  STAFF = 0,
  HR = 1,
  GDVP = 2,
}

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.STAFF]: [UserRole.STAFF],
  [UserRole.HR]: [UserRole.STAFF, UserRole.HR],
  [UserRole.GDVP]: [UserRole.STAFF, UserRole.HR, UserRole.GDVP],
};

// Permission definitions
export interface Permission {
  roles: UserRole[];
  requireAll?: boolean;
}

// Common permission sets
export const PERMISSIONS = {
  VIEW_STAFF: { roles: [UserRole.HR, UserRole.GDVP] },
  CREATE_STAFF: { roles: [UserRole.HR, UserRole.GDVP] },
  EDIT_STAFF: { roles: [UserRole.HR, UserRole.GDVP] },
  VIEW_BRANCHES: { roles: [UserRole.HR, UserRole.GDVP] },
  CREATE_BRANCHES: { roles: [UserRole.GDVP] },
  VIEW_SCHEDULES: { roles: [UserRole.HR, UserRole.GDVP] },
  MANAGE_SCHEDULES: { roles: [UserRole.HR, UserRole.GDVP] },
} as const;

export function hasPermission(
  userRole: UserRole | number | null | undefined,
  permission: Permission,
): boolean {
  if (userRole === null || userRole === undefined) return false;

  const role = typeof userRole === 'number' ? (userRole as UserRole) : userRole;
  const userPermissions = ROLE_HIERARCHY[role] || [];

  if (permission.requireAll) {
    return permission.roles.every((requiredRole) =>
      userPermissions.includes(requiredRole),
    );
  }

  return permission.roles.some((requiredRole) =>
    userPermissions.includes(requiredRole),
  );
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  userRole: UserRole | number | null | undefined,
  roles: UserRole[],
): boolean {
  return hasPermission(userRole, { roles });
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(
  userRole: UserRole | number | null | undefined,
  roles: UserRole[],
): boolean {
  return hasPermission(userRole, { roles, requireAll: true });
}

/**
 * Get role label for display
 */
export function getRoleLabel(
  role: UserRole | number | null | undefined,
): string {
  switch (role) {
    case UserRole.STAFF:
      return 'Staff';
    case UserRole.HR:
      return 'HR';
    case UserRole.GDVP:
      return 'GDVP';
    default:
      return 'N/A';
  }
}

/**
 * Check if role is higher than or equal to minimum required role
 */
export function hasMinimumRole(
  userRole: UserRole | number | null | undefined,
  minimumRole: UserRole,
): boolean {
  if (userRole === null || userRole === undefined) return false;

  const role = typeof userRole === 'number' ? (userRole as UserRole) : userRole;
  return role >= minimumRole;
}
