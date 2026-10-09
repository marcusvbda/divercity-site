'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOutIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/admin/ui/avatar'
import { Button } from '@/components/admin/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/admin/ui/dropdown-menu'

export function ProfileDropdown() {
  const { data: session } = useSession()

  const name = session?.user?.username ?? 'Usuário'
  const email = session?.user?.email ?? ''
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-transparent"
            aria-label="Menu do usuário"
          />
        }
      >
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-4 px-2 py-2.5 font-normal">
            <Avatar className="size-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-foreground max-w-full truncate text-base font-semibold">
                {name}
              </span>
              <span className="text-muted-foreground max-w-full truncate text-sm">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <LogOutIcon />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
