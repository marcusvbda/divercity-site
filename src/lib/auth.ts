import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Supabase",
      credentials: {
        identifier: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.identifier,
          password: credentials.password,
        });

        if (error || !data.user || !data.session) return null;

        // Usuários já existentes no Supabase antes da role `operator` ser
        // introduzida são preservados como `admin` (ver prisma/backfill-user-roles.ts).
        // Novos usuários entram como `operator` por padrão (menor privilégio).
        const dbUser = await prisma.user.upsert({
          where: { id: data.user.id },
          update: {
            email: data.user.email!,
            name: data.user.user_metadata?.name ?? null,
          },
          create: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name ?? null,
          },
        });

        return {
          id: data.user.id,
          name: data.user.user_metadata?.name ?? data.user.email,
          email: data.user.email!,
          username: data.user.user_metadata?.name ?? data.user.email!,
          supabaseAccessToken: data.session.access_token,
          role: dbUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? user.name ?? "";
        token.email = user.email ?? "";
        token.role = user.role;
        token.supabaseAccessToken = user.supabaseAccessToken;
        return token;
      }

      // Re-valida o token Supabase a cada refresh de sessão
      const { data, error } = await supabase.auth.getUser(
        token.supabaseAccessToken
      );

      if (error || !data.user) {
        token.error = "InvalidToken";
        return token;
      }

      // Revalida a role a cada refresh, para refletir mudanças feitas pelo Admin
      const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
      if (dbUser) {
        token.role = dbUser.role;
      }

      delete token.error;
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
        role: token.role,
      };
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
};
