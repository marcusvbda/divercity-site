import ReactMarkdown, { type Components } from 'react-markdown'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/admin/ui/tabs'
import { Textarea } from '@/components/admin/ui/textarea'

function omitNode<P extends { node?: unknown }>(props: P): Omit<P, 'node'> {
  const rest = { ...props }
  delete rest.node
  return rest
}

const markdownComponents: Components = {
  h1: (props) => (
    <h1
      className="mt-4 mb-2 text-xl font-semibold first:mt-0"
      {...omitNode(props)}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-4 mb-2 text-lg font-semibold first:mt-0"
      {...omitNode(props)}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-3 mb-1.5 text-base font-semibold first:mt-0"
      {...omitNode(props)}
    />
  ),
  p: (props) => (
    <p className="my-2 first:mt-0 last:mb-0" {...omitNode(props)} />
  ),
  ul: (props) => <ul className="my-2 list-disc pl-6" {...omitNode(props)} />,
  ol: (props) => <ol className="my-2 list-decimal pl-6" {...omitNode(props)} />,
  li: (props) => <li className="my-0.5" {...omitNode(props)} />,
  strong: (props) => <strong className="font-semibold" {...omitNode(props)} />,
  em: (props) => <em className="italic" {...omitNode(props)} />,
  a: (props) => (
    <a
      className="text-primary underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...omitNode(props)}
    />
  ),
  code: (props) => (
    <code
      className="bg-muted rounded px-1 py-0.5 font-mono text-xs"
      {...omitNode(props)}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-muted my-2 overflow-x-auto rounded-md p-3 [&_code]:bg-transparent [&_code]:p-0"
      {...omitNode(props)}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-border text-muted-foreground my-2 border-l-4 pl-3"
      {...omitNode(props)}
    />
  ),
}

type MarkdownFieldProps = {
  id: string
  value: string
  maxLength: number
  onChange: (value: string) => void
}

export function MarkdownField({
  id,
  value,
  maxLength,
  onChange,
}: MarkdownFieldProps) {
  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">Editar</TabsTrigger>
        <TabsTrigger value="preview">Visualizar</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Textarea
          id={id}
          className="field-sizing-fixed h-75 resize-y"
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </TabsContent>
      <TabsContent value="preview">
        <div className="border-input h-75 min-h-75 overflow-y-auto rounded-md border px-2.5 py-2 text-base wrap-break-word md:text-sm">
          {value.trim() ? (
            <ReactMarkdown components={markdownComponents}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">Nada para visualizar.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
