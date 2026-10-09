import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/admin/auth-card";
import { getContentType } from "@/lib/cms";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Redefinir senha — Admin Divercity" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const navbar = await getContentType("NavBar");
  const logoUrl = navbar?.Logo?.url?.value as string | undefined;

  if (error) {
    return (
      <AuthCard
        logoUrl={logoUrl}
        title="Link inválido"
        description="Este link de recuperação expirou ou já foi usado."
      >
        <Link
          href="/admin/login/esqueci-senha"
          className="text-card-foreground text-sm hover:underline"
        >
          Solicitar novo link
        </Link>
      </AuthCard>
    );
  }

  return (
    <Suspense>
      <ResetPasswordForm logoUrl={logoUrl} />
    </Suspense>
  );
}
