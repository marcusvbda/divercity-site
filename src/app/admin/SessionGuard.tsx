'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

export default function SessionGuard() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.error) {
      signOut({ callbackUrl: '/admin/login' })
    }
  }, [session])

  return null
}
