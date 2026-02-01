import { makePostgrestJWT } from './auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.novalys.io'

export async function postgrest(
  table: string,
  options: {
    method?: string
    body?: Record<string, unknown>
    query?: string
    headers?: Record<string, string>
    single?: boolean
  } = {}
) {
  const { method = 'GET', body, query = '', headers = {}, single = false } = options
  const token = makePostgrestJWT()

  const url = `${SUPABASE_URL}/${table}${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(single ? { Accept: 'application/vnd.pgrst.object+json' } : {}),
      ...(method === 'POST' ? { Prefer: 'return=representation' } : {}),
      ...(method === 'PATCH' ? { Prefer: 'return=representation' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PostgREST error ${res.status}: ${text}`)
  }

  if (res.status === 204) return null

  return res.json()
}
