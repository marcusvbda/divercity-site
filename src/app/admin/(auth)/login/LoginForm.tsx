'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'
import { AuthCard } from '@/components/admin/auth-card'
import { AuthPasswordInput } from '@/components/admin/auth-password-input'
import { Button } from '@/components/admin/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await signIn('credentials', {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      })
      if (result?.error) throw new Error('E-mail ou senha inválidos')
      return result
    },
    onSuccess: () => {
      window.location.href = callbackUrl
    },
    onError: (err: Error) => setServerError(err.message),
  })

  return (
    <AuthCard title="Entrar" description="Acesse o painel do Divercity Park">
      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.identifier}>
            <FieldLabel className="leading-5" htmlFor="identifier">
              E-mail
            </FieldLabel>
            <Input
              id="identifier"
              type="email"
              placeholder="m@exemplo.com"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={!!errors.identifier}
              {...register('identifier')}
            />
            <FieldError errors={[errors.identifier]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel className="leading-5" htmlFor="password">
              Senha
            </FieldLabel>
            <AuthPasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <div className="flex justify-end">
            <Link
              href="/admin/login/esqueci-senha"
              className="text-card-foreground text-sm hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {serverError && (
            <p className="text-destructive text-center text-sm">
              {serverError}
            </p>
          )}

          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
