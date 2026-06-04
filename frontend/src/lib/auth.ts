import { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Strapi',
      credentials: {
        identifier: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: credentials.identifier,
            password: credentials.password,
          }),
        })

        if (!res.ok) return null

        const { jwt, user } = await res.json()

        // Verifica role via token estático (evita depender de permissões do role)
        const meRes = await fetch(
          `${STRAPI_URL}/api/users/${user.id}?populate=role`,
          { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } }
        )

        if (!meRes.ok) return null

        const me = await meRes.json()

        if (me.role?.name !== 'Admin') return null

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
          username: user.username,
          strapiJwt: jwt,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.strapiJwt = user.strapiJwt
        token.id = user.id
        token.username = user.username ?? user.name ?? ''
        token.email = user.email ?? ''
        return token
      }

      // Re-valida o usuário no Strapi a cada refresh de sessão
      try {
        const res = await fetch(`${STRAPI_URL}/api/users/${token.id}`, {
          headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          token.error = 'InvalidToken'
          return token
        }

        const me = await res.json()

        if (me.blocked) {
          token.error = 'UserBlocked'
          return token
        }

        delete token.error
      } catch {
        token.error = 'NetworkError'
      }

      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
      }
      if (token.error) {
        session.error = token.error
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
}
