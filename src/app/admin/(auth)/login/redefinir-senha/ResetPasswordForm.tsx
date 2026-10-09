"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/schemas/auth";
import { AuthCard } from "@/components/admin/auth-card";
import { AuthPasswordInput } from "@/components/admin/auth-password-input";
import { Button } from "@/components/admin/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/admin/ui/field";

export default function ResetPasswordForm({ logoUrl }: { logoUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code] = useState(() => searchParams.get("code"));
  const [done, setDone] = useState(false);

  const { isPending: verifying, isError: exchangeFailed } = useQuery({
    queryKey: ["admin", "reset-password-exchange", code],
    queryFn: async () => {
      if (!code) throw new Error("Link inválido ou expirado.");
      const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
      history.replaceState(null, "", window.location.pathname);
      if (error) throw new Error("Link inválido ou expirado.");
      return true;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

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
      <AuthCard
        logoUrl={logoUrl}
        title="Senha redefinida!"
        description="Sua senha foi atualizada. Redirecionando para o login..."
      />
    );
  }

  if (exchangeFailed) {
    return (
      <AuthCard
        logoUrl={logoUrl}
        title="Link inválido"
        description="Link inválido ou expirado."
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

  if (verifying) {
    return (
      <AuthCard
        logoUrl={logoUrl}
        title="Redefinir senha"
        description="Verificando link..."
      >
        <div className="flex justify-center py-4">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      logoUrl={logoUrl}
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta"
    >
      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.password}>
            <FieldLabel className="leading-5" htmlFor="password">
              Nova senha
            </FieldLabel>
            <AuthPasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel className="leading-5" htmlFor="confirmPassword">
              Confirmar nova senha
            </FieldLabel>
            <AuthPasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>

          {mutateError && (
            <p className="text-destructive text-center text-sm">
              {mutateError.message}
            </p>
          )}

          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
