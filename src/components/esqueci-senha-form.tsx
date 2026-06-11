"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { forgotPasswordSchema as esqueciSenhaSchema, type ForgotPasswordFormData as EsqueciSenhaFormData } from "@/lib/schemas/auth";
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

export function EsqueciSenhaForm() {
  const [enviado, setEnviado] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaFormData>({
    resolver: zodResolver(esqueciSenhaSchema),
  });

  async function onSubmit(data: EsqueciSenhaFormData) {
    setServerError(null);
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
      data.email,
      { redirectTo: `${window.location.origin}/login/redefinir-senha` }
    );
    if (error) {
      setServerError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">E-mail enviado</CardTitle>
          <CardDescription>
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            O link expira em 1 hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            Voltar para o login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-heading">Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para redefinir sua senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-center text-sm">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold text-white"
            disabled={isSubmitting}
            style={{ background: "linear-gradient(90deg, #8E4CCF, #FF4F8A)" }}
          >
            {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
