"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/schemas/auth";
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

interface Props extends React.ComponentProps<"div"> {
  code: string;
}

export default function ResetPasswordForm({ code, className, ...props }: Props) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [exchangeOk, setExchangeOk] = useState(false);

  useEffect(() => {
    supabaseBrowser.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setExchangeError("Link inválido ou expirado.");
      else setExchangeOk(true);
    });
  }, [code]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate, isPending, error: mutateError } = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const { error } = await supabaseBrowser.auth.updateUser({
        password: data.password,
      });
      if (error) throw new Error("Não foi possível redefinir a senha.");
    },
    onSuccess: () => {
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 3000);
    },
  });

  if (done) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Senha redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi atualizada. Redirecionando para o login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (exchangeError) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Link inválido</CardTitle>
            <CardDescription>{exchangeError}</CardDescription>
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
      </div>
    );
  }

  if (!exchangeOk) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>Verificando link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>Escolha uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {mutateError && (
              <p className="text-destructive text-center text-sm">
                {mutateError.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
