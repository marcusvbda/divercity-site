"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/schemas/auth";
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
import { cn } from "@/lib/utils";

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        data.email,
        { redirectTo: `${window.location.origin}/admin/login/redefinir-senha` }
      );
      if (error) throw new Error("Não foi possível enviar o e-mail. Tente novamente.");
    },
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">E-mail enviado</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada e clique no link para redefinir sua
              senha. O link expira em 1 hora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/login"
              className="text-sm underline-offset-4 hover:underline"
            >
              Voltar para o login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Esqueci minha senha</CardTitle>
          <CardDescription>
            Insira seu e-mail para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@exemplo.com"
                autoComplete="email"
                disabled={isPending}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <p className="text-destructive text-center text-sm">{error.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                href="/admin/login"
                className="underline-offset-4 hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
