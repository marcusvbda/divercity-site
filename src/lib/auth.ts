import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

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

        return {
          id: data.user.id,
          name: data.user.user_metadata?.name ?? data.user.email,
          email: data.user.email!,
          username: data.user.user_metadata?.name ?? data.user.email!,
          supabaseAccessToken: data.session.access_token,
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

      delete token.error;
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
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
