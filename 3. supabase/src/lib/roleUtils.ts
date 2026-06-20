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

const LEGACY_ROLE_ALIASES: Record<string, AppRole> = {
  admin: "executive",
  account_holder: "subscriber",
  executive_admin: "executive",
  staff: "service",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  subscriber: "Subscriber",
  stakeholder: "Stakeholder",
  service: "Service",
  support: "Support",
  sales_agent: "Sales Agent",
  executive: "Executive",
};

export const normalizeRole = (role?: string | null): AppRole | null => {
  if (!role) return null;

  const normalized = role.toLowerCase().trim();
  if (normalized in ROLES) return normalized as AppRole;
  return LEGACY_ROLE_ALIASES[normalized] ?? null;
};

export const resolveEffectiveRole = (profileRole?: string | null, fallbackRole?: string | null): AppRole | null => {
  return normalizeRole(profileRole) ?? normalizeRole(fallbackRole);
};

/** Check if a role is at or above a minimum level */
export const isRoleAtLeast = (role: string, minRole: AppRole): boolean => {
  const normalizedRole = normalizeRole(role);
  const minLevel = ROLES[minRole];
  if (!normalizedRole || minLevel == null) return false;

  const level = ROLES[normalizedRole];
  return level != null && level >= minLevel;
};

/** Check if a role is in a list of allowed roles */
export const isRoleIn = (role: string, allowedRoles: AppRole[]): boolean => {
  const normalizedRole = normalizeRole(role);
  return normalizedRole != null && allowedRoles.includes(normalizedRole);
};

/** Check if the user is an admin-level role (L3+) */
export const isAdminRole = (role: string): boolean => {
  return isRoleAtLeast(role, "service");
};
