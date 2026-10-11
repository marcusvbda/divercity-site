import type { Metadata } from 'next'
import { SwaggerDocs } from './SwaggerDocs'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ApiDocsPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Documentação da API</h1>
        <p className="text-sm text-neutral-600">
          Use o botão Authorize com um token Bearer para testar as rotas.
        </p>
      </div>

      <SwaggerDocs />
    </main>
  )
}
