import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: { absolute: "Entrar — Admin Divercity" },
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  await connection();
  const session = await getServerSession(authOptions);

  if (session && !session.error) {
    redirect(session.user.role === "operator" ? "/admin/operacao" : "/admin");
  }


  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
