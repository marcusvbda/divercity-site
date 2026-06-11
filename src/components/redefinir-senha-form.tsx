"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { resetPasswordSchema as redefinirSenhaSchema, type ResetPasswordFormData as RedefinirSenhaFormData } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RedefinirSenhaForm() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [sessaoValida, setSessaoValida] = useState<boolean | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Detecta sessão de recuperação vinda do link do e-mail
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessaoValida(true);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
  });

  async function onSubmit(data: RedefinirSenhaFormData) {
    setServerError(null);
    const { error } = await supabaseBrowser.auth.updateUser({
      password: data.password,
    });
    if (error) {
      setServerError("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }
    setPronto(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (pronto) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Senha redefinida!</CardTitle>
          <CardDescription>
            Sua senha foi atualizada com sucesso. Redirecionando para o login...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sessaoValida === false) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Link inválido</CardTitle>
          <CardDescription>
            Este link de recuperação expirou ou já foi usado.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/login/esqueci-senha"
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: "#8E4CCF" }}
          >
            Solicitar novo link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading">Redefinir senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-center text-sm">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold text-white"
            disabled={isSubmitting || sessaoValida === null}
            style={{ background: "linear-gradient(90deg, #8E4CCF, #FF4F8A)" }}
          >
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
