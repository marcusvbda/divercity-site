'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3">
      <div className="h-10 w-1/2 animate-pulse rounded-md bg-neutral-200" />
      <div className="h-64 w-full animate-pulse rounded-md bg-neutral-200" />
    </div>
  ),
})

export function SwaggerDocs() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white p-4 text-neutral-900">
      <SwaggerUI
        url="/api/v1/openapi.json"
        persistAuthorization
        tryItOutEnabled
        docExpansion="list"
      />
    </div>
  )
}
