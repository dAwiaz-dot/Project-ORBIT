import type { UserRole } from "@prisma/client";

export type Permission =
  | "leads:read"
  | "leads:update"
  | "searchJobs:create"
  | "searchJobs:read"
  | "team:read"
  | "team:write"
  | "settings:read"
  | "settings:write"
  | "exports:create"
  | "audit:read"
  | "finance:read"
  | "finance:write";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    "leads:read",
    "leads:update",
    "searchJobs:create",
    "searchJobs:read",
    "team:read",
    "team:write",
    "settings:read",
    "settings:write",
    "exports:create",
    "audit:read",
    "finance:read",
    "finance:write"
  ],
  SELLER: ["leads:read", "leads:update", "searchJobs:create", "searchJobs:read", "exports:create"],
  FINANCE: ["leads:read", "team:read", "exports:create", "audit:read", "settings:read", "finance:read", "finance:write"]
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
