'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { absoluteUrl } from '@/lib/helpers'

interface LoginFormProps {
  logoUrl: string | null
}

export default function LoginForm({ logoUrl }: LoginFormProps) {
  const router = useRouter()
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

      if (result?.error) throw new Error('Email ou senha inválidos')
      return result
    },
    onSuccess: () => router.push('/admin'),
    onError: (err: Error) => setServerError(err.message),
  })

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Painel decorativo — lado esquerdo */}
      <div
        className="relative hidden flex-col items-center justify-center gap-6 overflow-hidden p-10 text-white lg:flex"
        style={{
          background:
            'linear-gradient(135deg, #8E4CCF 0%, #FF4F8A 50%, #12C7C8 100%)',
        }}
      >
        {/* Blobs decorativos de fundo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #FFD23F 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #9AD94B 0%, transparent 50%)`,
          }}
        />

        {/* Logo centralizada — mesma do Hero */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={absoluteUrl(logoUrl) as string}
              alt="Divercity Park"
              className="h-48 w-48 drop-shadow-2xl md:h-48 md:w-48"
            />
          ) : (
            /* Fallback enquanto CMS estiver indisponível */
            <div
              className="flex h-32 w-32 items-center justify-center rounded-3xl text-5xl font-bold"
              style={{
                background: 'rgba(255,255,255,0.25)',
                fontFamily: 'var(--font-fredoka)',
              }}
            >
              D
            </div>
          )}

          {/* Citação de rodapé */}
          <blockquote className="mt-4 space-y-1 text-center">
            <p
              className="text-lg leading-relaxed opacity-90"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Área administrativa
            </p>
          </blockquote>
        </div>
      </div>

      {/* Painel do formulário — lado direito */}
      <div className="flex items-center justify-center px-8 py-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          {/* Cabeçalho */}
          <div className="space-y-2 text-center">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-fredoka)' }}
            >
              Área restrita
            </h1>
            <p
              className="text-muted-foreground text-sm"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Acesso exclusivo para administradores
            </p>
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit((data) => mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Email
              </Label>
              <Input
                id="identifier"
                type="email"
                placeholder="seu@email.com"
                {...register('identifier')}
                disabled={isPending}
              />
              {errors.identifier && (
                <p
                  className="text-destructive text-sm"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Senha
                </Label>
                {/* TODO: implementar recuperação de senha
                <a
                  href="/admin/esqueci-senha"
                  className="text-sm underline-offset-4 hover:underline text-muted-foreground"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Esqueci minha senha
                </a>
                */}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isPending}
              />
              {errors.password && (
                <p
                  className="text-destructive text-sm"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p
                className="text-destructive text-center text-sm"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full font-semibold text-white"
              disabled={isPending}
              style={{
                background: 'linear-gradient(90deg, #8E4CCF, #FF4F8A)',
                fontFamily: 'var(--font-poppins)',
              }}
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* TODO: implementar cadastro de novos usuários admin
          <div className="text-center text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
            Não tem uma conta?{' '}
            <a href="/admin/cadastro" className="underline underline-offset-4 hover:text-primary">
              Criar conta
            </a>
          </div>
          */}
        </div>
      </div>
    </div>
  )
}
