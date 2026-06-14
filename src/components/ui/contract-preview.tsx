'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { useEffect } from 'react'

type Props = { html: string }

export function ContractPreview({ html }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: html,
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && html !== editor.getHTML()) {
      editor.commands.setContent(html)
    }
  }, [editor, html])

  if (!editor) return null

  return (
    <EditorContent
      editor={editor}
      className="tiptap-editor text-sm"
    />
  )
}
