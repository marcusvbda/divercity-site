import { getCMSConfig } from '@/lib/cms'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const config = await getCMSConfig()
  const heroImage: string = String(config?.hero?.image?.url ?? '')

  return <LoginForm logoUrl={heroImage} />
}
