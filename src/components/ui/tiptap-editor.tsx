'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useState } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  PlusIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Props = {
  content: string
  onChange: (html: string) => void
}

export function TipTapEditor({ content, onChange }: Props) {
  const [varName, setVarName] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  const ToolbarBtn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'hover:bg-muted rounded p-1.5 text-sm transition-colors',
        active && 'bg-muted text-foreground',
        !active && 'text-muted-foreground'
      )}
    >
      {children}
    </button>
  )

  function insertVariable() {
    const name = varName.trim().replace(/\s+/g, '_')
    if (!name) return
    editor.chain().focus().insertContent(`{{${name}}}`).run()
    setVarName('')
    setPopoverOpen(false)
  }

  return (
    <div className="rounded-lg border">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito"
        >
          <BoldIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico"
        >
          <ItalicIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarBtn>

        <div className="bg-border mx-1 h-5 w-px" />

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <Heading1Icon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2Icon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <Heading3Icon className="size-4" />
        </ToolbarBtn>

        <div className="bg-border mx-1 h-5 w-px" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista"
        >
          <ListIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrderedIcon className="size-4" />
        </ToolbarBtn>

        <div className="bg-border mx-1 h-5 w-px" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar esquerda"
        >
          <AlignLeftIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenterIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar direita"
        >
          <AlignRightIcon className="size-4" />
        </ToolbarBtn>

        <div className="bg-border mx-1 h-5 w-px" />

        {/* Insert variable */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                <PlusIcon className="size-3" />
                Variável extra
              </Button>
            }
          />
          <PopoverContent className="w-64 p-3">
            <p className="text-muted-foreground mb-2 text-xs">
              Nome da variável (ex: nome_cliente)
            </p>
            <div className="flex gap-2">
              <Input
                value={varName}
                onChange={(e) => setVarName(e.target.value)}
                placeholder="nome_variavel"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && insertVariable()}
              />
              <Button size="sm" onClick={insertVariable} className="h-8">
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="tiptap-editor min-h-64 px-4 py-3 text-sm focus-within:outline-none"
      />
    </div>
  )
}
