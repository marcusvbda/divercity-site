"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
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

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: data.identifier,
      password: data.password,
    });
    if (error) {
      setServerError("Email ou senha inválidos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta com e-mail e senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="identifier">E-mail</Label>
              <Input
                id="identifier"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="text-destructive text-sm">{errors.identifier.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/login/esqueci-senha"
                  className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
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
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
