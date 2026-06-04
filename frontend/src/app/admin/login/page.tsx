'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'

export default function LoginPage() {
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
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '100px auto' }}>
      <h1>Área restrita</h1>
      <form onSubmit={handleSubmit((data) => mutate(data))}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="identifier">Email</label>
          <br />
          <input
            id="identifier"
            type="email"
            {...register('identifier')}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.identifier && (
            <p style={{ color: 'red', margin: '0.25rem 0 0' }}>
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Senha</label>
          <br />
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {errors.password && (
            <p style={{ color: 'red', margin: '0.25rem 0 0' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{serverError}</p>
        )}

        <button type="submit" disabled={isPending} style={{ padding: '0.5rem 1.5rem' }}>
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
