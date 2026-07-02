import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
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
      async authorize(credentials) {
        if (!credentials?.login || !credentials.password) return null;
        const login = credentials.login.trim();

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: login, mode: "insensitive" } },
                { name: { equals: login, mode: "insensitive" } }
              ]
            }
          });

          if (!user?.passwordHash) return getDevelopmentAdmin(login, credentials.password);

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
          return getDevelopmentAdmin(login, credentials.password);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as UserRole;
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
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "SELLER";
      }
      return session;
    }
  }
};

function getDevelopmentAdmin(login: string, password: string) {
  if (process.env.NODE_ENV === "production") return null;

  const adminName = process.env.SEED_ADMIN_NAME ?? "Davi";
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "davi@orbit.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "110391";

  if (login.toLowerCase() !== adminName.toLowerCase() && login.toLowerCase() !== adminEmail.toLowerCase()) {
    return null;
  }

  if (password !== adminPassword) return null;

  return {
    id: "development-admin-davi",
    email: adminEmail,
    name: adminName,
    image: null,
    role: UserRole.ADMIN
  };
}
