import { createHmac, timingSafeEqual } from "node:crypto";
import { UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { authSecret } from "@/lib/auth-secret";

type DemoTeamUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  image: string | null;
  passwordHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoTeamUserDto = Omit<DemoTeamUserRecord, "passwordHash"> & {
  hasPassword: boolean;
};

type DemoTeamState = {
  users: DemoTeamUserRecord[];
};

export class DemoTeamError extends Error {
  constructor(
    public readonly status: 400 | 404 | 409,
    message: string
  ) {
    super(message);
    this.name = "DemoTeamError";
  }
}

const fallbackAdminPasswordHash = "$2a$12$G9E9.FIOVWuFr6cBg36Rrei0k2vgILdpazvfsdypwbbLH8/fBsUBe";
export const DEMO_TEAM_COOKIE_NAME = "orbit_demo_team";
export const DEMO_TEAM_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const globalForDemoTeam = globalThis as typeof globalThis & {
  orbitDemoTeamState?: DemoTeamState;
};

const demoTeamState = (globalForDemoTeam.orbitDemoTeamState ??= {
  users: [createDefaultAdmin()]
});

export function listDemoTeamUsers() {
  ensureDefaultAdmin();
  return demoTeamState.users.map(toDemoTeamUserDto);
}

export function hydrateDemoTeamUsersFromCookie(cookieHeader: string | null | undefined) {
  const value = getCookieValue(cookieHeader, DEMO_TEAM_COOKIE_NAME);
  const users = decodeDemoTeamCookie(value);
  if (!users.length) return;

  const byId = new Map(demoTeamState.users.map((user) => [user.id, user]));
  for (const user of users) {
    if (user.id !== "development-admin-davi") byId.set(user.id, user);
  }
  demoTeamState.users = [...byId.values()];
  ensureDefaultAdmin();
}

export function encodeDemoTeamCookie() {
  const payload = JSON.stringify({
    users: demoTeamState.users.filter((user) => user.id.startsWith("demo-user-"))
  });
  const data = Buffer.from(payload, "utf8").toString("base64url");
  return `${data}.${signCookieData(data)}`;
}

export async function createDemoTeamUser(input: { name: string; email: string; password: string; role: UserRole }) {
  ensureDefaultAdmin();
  const email = normalizeEmail(input.email);
  assertUniqueEmail(email);

  const now = new Date().toISOString();
  const user: DemoTeamUserRecord = {
    id: `demo-user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    email,
    role: input.role,
    image: null,
    passwordHash: await hash(input.password, 12),
    createdAt: now,
    updatedAt: now
  };

  demoTeamState.users = [user, ...demoTeamState.users];
  return toDemoTeamUserDto(user);
}

export async function updateDemoTeamUser(
  id: string,
  input: { name?: string; email?: string; password?: string; role?: UserRole }
) {
  ensureDefaultAdmin();
  const index = demoTeamState.users.findIndex((user) => user.id === id);
  if (index < 0) throw new DemoTeamError(404, "Usuario nao encontrado.");

  const current = demoTeamState.users[index];
  if (input.role && input.role !== UserRole.ADMIN && current.role === UserRole.ADMIN && countAdmins(id) === 0) {
    throw new DemoTeamError(400, "Mantenha pelo menos um administrador ativo.");
  }

  const email = input.email ? normalizeEmail(input.email) : undefined;
  if (email) assertUniqueEmail(email, id);

  const updated: DemoTeamUserRecord = {
    ...current,
    name: input.name ?? current.name,
    email: email ?? current.email,
    role: input.role ?? current.role,
    passwordHash: input.password ? await hash(input.password, 12) : current.passwordHash,
    updatedAt: new Date().toISOString()
  };

  demoTeamState.users[index] = updated;
  return toDemoTeamUserDto(updated);
}

export function deleteDemoTeamUser(id: string, actorId?: string | null) {
  ensureDefaultAdmin();
  const user = demoTeamState.users.find((item) => item.id === id);
  if (!user) return;

  if (actorId === id) throw new DemoTeamError(400, "Voce nao pode remover seu proprio acesso.");
  if (user.role === UserRole.ADMIN && countAdmins(id) === 0) {
    throw new DemoTeamError(400, "Mantenha pelo menos um administrador ativo.");
  }

  demoTeamState.users = demoTeamState.users.filter((item) => item.id !== id);
}

export async function authenticateDemoTeamUser(login: string, password: string, cookieHeader?: string | null) {
  hydrateDemoTeamUsersFromCookie(cookieHeader);
  ensureDefaultAdmin();
  const normalizedLogin = login.trim().toLowerCase();
  const user = demoTeamState.users.find(
    (item) => item.email?.toLowerCase() === normalizedLogin || item.name?.toLowerCase() === normalizedLogin
  );

  if (!user?.passwordHash) return null;
  const valid = await compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role
  };
}

export function isDemoTeamError(error: unknown): error is DemoTeamError {
  return error instanceof DemoTeamError;
}

function createDefaultAdmin(): DemoTeamUserRecord {
  const now = new Date().toISOString();
  return {
    id: "development-admin-davi",
    name: process.env.ORBIT_ADMIN_LOGIN ?? process.env.SEED_ADMIN_NAME ?? "Davi",
    email: process.env.ORBIT_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "davi@orbit.local",
    role: UserRole.ADMIN,
    image: null,
    passwordHash: process.env.ORBIT_ADMIN_PASSWORD_HASH ?? fallbackAdminPasswordHash,
    createdAt: now,
    updatedAt: now
  };
}

function ensureDefaultAdmin() {
  if (!demoTeamState.users.some((user) => user.id === "development-admin-davi")) {
    demoTeamState.users.push(createDefaultAdmin());
  }
}

function toDemoTeamUserDto(user: DemoTeamUserRecord): DemoTeamUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertUniqueEmail(email: string, ignoreId?: string) {
  const exists = demoTeamState.users.some((user) => user.id !== ignoreId && user.email?.toLowerCase() === email);
  if (exists) throw new DemoTeamError(409, "Este email ja esta cadastrado.");
}

function countAdmins(ignoreId?: string) {
  return demoTeamState.users.filter((user) => user.id !== ignoreId && user.role === UserRole.ADMIN).length;
}

function decodeDemoTeamCookie(value: string | null | undefined): DemoTeamUserRecord[] {
  if (!value) return [];

  const [data, signature] = value.split(".");
  if (!data || !signature || !verifyCookieSignature(data, signature)) return [];

  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as { users?: unknown };
    if (!Array.isArray(parsed.users)) return [];

    return parsed.users.flatMap((item) => {
      const user = toDemoTeamUserRecord(item);
      return user ? [user] : [];
    });
  } catch {
    return [];
  }
}

function toDemoTeamUserRecord(value: unknown): DemoTeamUserRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<DemoTeamUserRecord>;
  if (!record.id?.startsWith("demo-user-")) return null;
  if (!record.email || !record.passwordHash) return null;
  if (record.role !== UserRole.ADMIN && record.role !== UserRole.SELLER && record.role !== UserRole.FINANCE) return null;

  return {
    id: record.id,
    name: record.name ?? null,
    email: normalizeEmail(record.email),
    role: record.role,
    image: record.image ?? null,
    passwordHash: record.passwordHash,
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? new Date().toISOString()
  };
}

function signCookieData(data: string) {
  return createHmac("sha256", authSecret).update(data).digest("base64url");
}

function verifyCookieSignature(data: string, signature: string) {
  const expected = Buffer.from(signCookieData(data));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function getCookieValue(header: string | null | undefined, name: string) {
  return header
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
