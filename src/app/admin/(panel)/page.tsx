'use client'

import { useSession } from 'next-auth/react'
import DashboardContent from './DashboardContent'

export default function AdminPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const userName = user?.name ?? user?.username ?? 'Admin'

  return <DashboardContent userName={userName} />
}
