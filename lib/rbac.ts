import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  | "audit:read";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  FINANCE: "Financeiro"
};

const rolePermissions: Record<UserRole, Permission[]> = {
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
    "audit:read"
  ],
  SELLER: ["leads:read", "leads:update", "searchJobs:create", "searchJobs:read", "exports:create"],
  FINANCE: ["leads:read", "team:read", "exports:create", "audit:read", "settings:read"]
};

export class RbacError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "RbacError";
  }
}

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const sessionUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role
  };
  const canUseSessionFallback =
    session.user.id === "development-admin-davi" ||
    session.user.id.startsWith("demo-user-") ||
    process.env.NODE_ENV !== "production" ||
    !process.env.DATABASE_URL;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!dbUser) return canUseSessionFallback ? sessionUser : null;
    return dbUser;
  } catch (error) {
    console.error("Falha ao carregar usuario atual", error);
    return canUseSessionFallback ? sessionUser : null;
  }
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user) {
    throw new RbacError(401, "Sessao obrigatoria.");
  }

  if (!hasPermission(user.role, permission)) {
    throw new RbacError(403, "Usuario sem permissao para esta acao.");
  }

  return user;
}

export function isRbacError(error: unknown): error is RbacError {
  return error instanceof RbacError;
}

export function rbacErrorResponse(error: RbacError) {
  return NextResponse.json({ error: error.message }, { status: error.status });
}
