// Role hierarchy levels for the UCG platform
export const ROLES = {
  subscriber: 1,
  stakeholder: 2,
  service: 3,
  support: 4,
  sales_agent: 5,
  executive: 6,
} as const;

export type AppRole = keyof typeof ROLES;

export const ROLE_LABELS: Record<AppRole, string> = {
  subscriber: "Subscriber",
  stakeholder: "Stakeholder",
  service: "Service",
  support: "Support",
  sales_agent: "Sales Agent",
  executive: "Executive",
};

/** Check if a role is at or above a minimum level */
export const isRoleAtLeast = (role: string, minRole: AppRole): boolean => {
  const level = ROLES[role as AppRole];
  const minLevel = ROLES[minRole];
  return level != null && minLevel != null && level >= minLevel;
};

/** Check if a role is in a list of allowed roles */
export const isRoleIn = (role: string, allowedRoles: AppRole[]): boolean => {
  return allowedRoles.includes(role as AppRole);
};

/** Check if the user is an admin-level role (L3+) */
export const isAdminRole = (role: string): boolean => {
  return isRoleAtLeast(role, "service");
};
