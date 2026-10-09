'use client'

import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/admin/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/admin/ui/input-group'

export function AuthPasswordInput({
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput type={visible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end" className="pr-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible((prev) => !prev)}
          className="text-muted-foreground rounded-l-none hover:bg-transparent"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
          <span className="sr-only">
            {visible ? 'Ocultar senha' : 'Mostrar senha'}
          </span>
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}
