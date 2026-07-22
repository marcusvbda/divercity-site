import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Redefinir senha — Admin Divercity" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Link inválido</CardTitle>
              <CardDescription>
                Este link de recuperação expirou ou já foi usado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/login/esqueci-senha"
                className="text-sm underline-offset-4 hover:underline"
              >
                Solicitar novo link
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ResetPasswordForm />
        )}
      </div>
    </div>
  );
}
