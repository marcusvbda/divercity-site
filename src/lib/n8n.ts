const REQUEST_TIMEOUT_MS = 10_000

export type N8nErrorKind =
  | 'not_configured'
  | 'unauthorized'
  | 'not_found'
  | 'table_not_found'
  | 'bad_request'
  | 'unavailable'
  | 'timeout'

const ERROR_MESSAGES: Record<N8nErrorKind, string> = {
  not_configured: 'Integração com o n8n não configurada',
  unauthorized: 'O n8n recusou a chave de API. Verifique a chave e os escopos.',
  not_found: 'Recurso não encontrado no n8n',
  table_not_found: 'Tabela faqs não encontrada no n8n',
  bad_request: 'O n8n rejeitou a requisição. Verifique os dados enviados.',
  unavailable: 'O n8n está indisponível. Tente novamente.',
  timeout: 'O n8n não respondeu a tempo. Tente novamente.',
}

export class N8nError extends Error {
  kind: N8nErrorKind
  status?: number

  constructor(kind: N8nErrorKind, status?: number, message?: string) {
    super(message ?? ERROR_MESSAGES[kind])
    this.name = 'N8nError'
    this.kind = kind
    this.status = status
  }
}

interface N8nRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
}

function kindFromStatus(status: number): N8nErrorKind {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status >= 500) return 'unavailable'
  return 'bad_request'
}

export async function n8nRequest<T>(
  path: string,
  { method = 'GET', query, body }: N8nRequestOptions = {},
): Promise<T> {
  const baseUrl = process.env.N8N_BASE_URL?.trim().replace(/\/+$/, '')
  const apiKey = process.env.N8N_API_KEY?.trim()
  if (!baseUrl || !apiKey) throw new N8nError('not_configured')

  const url = new URL(`${baseUrl}/api/v1${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    }
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    console.error(`[n8n] ${method} ${path} ${isTimeout ? 'timeout' : 'network error'}`)
    throw new N8nError(isTimeout ? 'timeout' : 'unavailable')
  }

  if (!res.ok) {
    console.error(`[n8n] ${method} ${path} -> ${res.status}`)
    throw new N8nError(kindFromStatus(res.status), res.status)
  }

  try {
    return (await res.json()) as T
  } catch {
    console.error(`[n8n] ${method} ${path} -> invalid JSON response`)
    throw new N8nError('unavailable', res.status)
  }
}
