import { connection } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LogoutButton from './LogoutButton'

export default async function AdminPage() {
  await connection()
  const session = await getServerSession(authOptions)

  return (
    <div style={{ padding: '2rem' }}>
      <p>Olá, {session?.user.username}</p>
      <LogoutButton />
    </div>
  )
}
