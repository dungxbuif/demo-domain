export enum UserRole {
  GDVP = 0,
  HR = 1,
  STAFF = 2,
}

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.STAFF]: [UserRole.STAFF],
  [UserRole.HR]: [UserRole.STAFF, UserRole.HR],
  [UserRole.GDVP]: [UserRole.STAFF, UserRole.HR, UserRole.GDVP],
};
export interface Permission {
  readonly roles: readonly UserRole[];
  requireAll?: boolean;
}
const ALL_ROLES = [UserRole.GDVP, UserRole.HR, UserRole.STAFF];
export const PERMISSIONS = {
  VIEW_STAFF: { roles: ALL_ROLES },
  CREATE_STAFF: { roles: [UserRole.HR, UserRole.GDVP] },
  EDIT_STAFF: { roles: [UserRole.HR, UserRole.GDVP] },
  VIEW_BRANCHES: { roles: ALL_ROLES },
  CREATE_BRANCHES: { roles: [UserRole.GDVP] },
  VIEW_SCHEDULES: { roles: ALL_ROLES },
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
