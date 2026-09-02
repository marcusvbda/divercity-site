import "next-auth";
import "next-auth/jwt";
import type { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: UserRole;
    };
    error?: string;
  }

  interface User {
    supabaseAccessToken: string;
    username: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    supabaseAccessToken: string;
    id: string;
    username: string;
    email: string;
    role: UserRole;
    error?: string;
  }
}
