import { redirect } from 'next/navigation'

export default function PassportTypesPage() {
  redirect('/admin/services?tab=passaportes')
}
