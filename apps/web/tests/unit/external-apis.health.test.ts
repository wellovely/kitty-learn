import { describe, expect, it } from "vitest"

const HEALTH_TIMEOUT_MS = 15_000

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = HEALTH_TIMEOUT_MS, ...rest } = init
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...rest, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

describe("OpenRouter API liveness", () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  it.skipIf(!apiKey)(
    "responds 200 to GET /api/v1/auth/key with the configured token",
    async () => {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/auth/key",
        { headers: { Authorization: `Bearer ${apiKey}` } }
      )
      expect(res.status).toBe(200)
      const body = (await res.json()) as { data?: { label?: string } }
      expect(body.data).toBeTypeOf("object")
    },
    HEALTH_TIMEOUT_MS
  )

  it.skipIf(!apiKey)(
    "lists at least one model on /api/v1/models",
    async () => {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/models",
        { headers: { Authorization: `Bearer ${apiKey}` } }
      )
      expect(res.ok).toBe(true)
      const body = (await res.json()) as { data?: unknown[] }
      expect(Array.isArray(body.data)).toBe(true)
      expect((body.data ?? []).length).toBeGreaterThan(0)
    },
    HEALTH_TIMEOUT_MS
  )
})

describe("Deepgram API liveness", () => {
  const apiKey = process.env.DEEPGRAM_API_KEY
  it.skipIf(!apiKey)(
    "authenticates and returns projects via GET /v1/projects",
    async () => {
      const res = await fetchWithTimeout(
        "https://api.deepgram.com/v1/projects",
        { headers: { Authorization: `Token ${apiKey}` } }
      )
      expect(res.status).toBe(200)
      const body = (await res.json()) as { projects?: unknown[] }
      expect(Array.isArray(body.projects)).toBe(true)
    },
    HEALTH_TIMEOUT_MS
  )

  it.skipIf(!apiKey)(
    "rejects unauthorized requests (401) when no token is sent",
    async () => {
      const res = await fetchWithTimeout(
        "https://api.deepgram.com/v1/projects"
      )
      expect(res.status).toBe(401)
    },
    HEALTH_TIMEOUT_MS
  )
})

describe("Supabase local instance liveness", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  it.skipIf(!url)(
    "responds on /auth/v1/health",
    async () => {
      const res = await fetchWithTimeout(`${url}/auth/v1/health`)
      expect(res.ok).toBe(true)
    },
    HEALTH_TIMEOUT_MS
  )

  it.skipIf(!url || !anonKey)(
    "accepts the anon key on the REST endpoint",
    async () => {
      const res = await fetchWithTimeout(`${url}/rest/v1/`, {
        headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey}` },
      })
      // 200 (OpenAPI doc) or 404 (no resource) both indicate the gateway accepted the key.
      expect([200, 404]).toContain(res.status)
    },
    HEALTH_TIMEOUT_MS
  )
})
