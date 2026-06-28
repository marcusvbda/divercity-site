import { prisma } from '@/lib/prisma'
import { SettingsContent } from './SettingsContent'

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany()
  return <SettingsContent settings={settings} />
}
