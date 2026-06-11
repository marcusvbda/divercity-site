import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RedefinirSenhaForm from "./RedefinirSenhaForm";

export const metadata = { title: "Redefinir senha — Admin Divercity" };

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  const isInvalid = !code || !!error;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {isInvalid ? (
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
          <RedefinirSenhaForm code={code} />
        )}
      </div>
    </div>
  );
}
