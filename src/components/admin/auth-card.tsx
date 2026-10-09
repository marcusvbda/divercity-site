import Link from 'next/link'

import AuthBackgroundShape from '@/components/admin/auth-background-shape'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'

type AuthCardProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="relative flex h-auto min-h-svh items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-1 w-full gap-6 py-6 sm:max-w-lg">
        <CardHeader className="gap-6 px-6">
          <div>
            <CardTitle className="mb-2 text-2xl font-semibold">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        {children && <CardContent className="px-6">{children}</CardContent>}
      </Card>
    </div>
  )
}
