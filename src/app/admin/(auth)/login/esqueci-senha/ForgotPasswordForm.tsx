'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/schemas/auth'
import { AuthCard } from '@/components/admin/auth-card'
import { Button } from '@/components/admin/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        data.email,
        { redirectTo: `${window.location.origin}/admin/login/redefinir-senha` }
      )
      if (error)
        throw new Error('Não foi possível enviar o e-mail. Tente novamente.')
    },
    onSuccess: () => setSent(true),
  })

  if (sent) {
    return (
      <AuthCard
        title="E-mail enviado"
        description="Verifique sua caixa de entrada e clique no link para redefinir sua senha. O link expira em 1 hora."
      >
        <Link
          href="/admin/login"
          className="text-card-foreground text-sm hover:underline"
        >
          Voltar ao login
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      description="Insira seu e-mail para receber um link de recuperação"
    >
      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel className="leading-5" htmlFor="email">
              E-mail
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@exemplo.com"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          {error && (
            <p className="text-destructive text-center text-sm">
              {error.message}
            </p>
          )}

          <Field>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>
          </Field>

          <p className="text-center text-sm">
            <Link
              href="/admin/login"
              className="text-card-foreground hover:underline"
            >
              Voltar ao login
            </Link>
          </p>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
