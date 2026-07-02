import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { authSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";
import { createSessionExpiresAt, isSessionExpired, SESSION_MAX_AGE_SECONDS } from "@/lib/session-policy";
import { authenticateDemoTeamUser } from "@/services/demo/team-store";

export const authOptions: NextAuthOptions = {
  ...(process.env.DATABASE_URL ? { adapter: PrismaAdapter(prisma) } : {}),
  secret: authSecret,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Orbit Login",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.login || !credentials.password) return null;
        const login = credentials.login.trim();
        const cookieHeader = request.headers?.cookie;

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: login, mode: "insensitive" } },
                { name: { equals: login, mode: "insensitive" } }
              ]
            }
          });

          if (!user?.passwordHash) {
            return (await authenticateDemoTeamUser(login, credentials.password, cookieHeader)) ?? getDevelopmentAdmin(login, credentials.password);
          }

          const valid = await compare(credentials.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          };
        } catch (error) {
          console.error("Falha ao autenticar via banco", error);
          return (await authenticateDemoTeamUser(login, credentials.password, cookieHeader)) ?? getDevelopmentAdmin(login, credentials.password);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as UserRole;
        token.sessionExpiresAt = createSessionExpiresAt();
        token.sessionExpired = false;
      }

      if (isSessionExpired(token.sessionExpiresAt)) {
        token.role = undefined;
        token.sessionExpired = true;
        return token;
      }

      if (!token.role && token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true }
          });
          token.role = dbUser?.role;
        } catch {
          if (token.sub === "development-admin-davi") {
            token.role = UserRole.ADMIN;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (isSessionExpired(token.sessionExpiresAt)) {
        return {
          ...session,
          expires: new Date(0).toISOString(),
          user: {
            ...session.user,
            id: "",
            role: UserRole.SELLER
          }
        };
      }

      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "SELLER";
      }
      session.expires = new Date(token.sessionExpiresAt as number).toISOString();
      return session;
    }
  }
};

const fallbackAdminPasswordHash = "$2a$12$G9E9.FIOVWuFr6cBg36Rrei0k2vgILdpazvfsdypwbbLH8/fBsUBe";

async function getDevelopmentAdmin(login: string, password: string) {
  const adminName = process.env.ORBIT_ADMIN_LOGIN ?? process.env.SEED_ADMIN_NAME ?? "Davi";
  const adminEmail = process.env.ORBIT_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "davi@orbit.local";
  const adminPassword = process.env.ORBIT_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD;
  const adminPasswordHash = process.env.ORBIT_ADMIN_PASSWORD_HASH ?? fallbackAdminPasswordHash;

  if (login.toLowerCase() !== adminName.toLowerCase() && login.toLowerCase() !== adminEmail.toLowerCase()) {
    return null;
  }

  const valid = adminPassword ? password === adminPassword : await compare(password, adminPasswordHash);
  if (!valid) return null;

  return {
    id: "development-admin-davi",
    email: adminEmail,
    name: adminName,
    image: null,
    role: UserRole.ADMIN
  };
}
