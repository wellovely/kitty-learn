import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth/session"

const MAX_BYTES = 25 * 1024 * 1024
const DG_MODEL = "nova-3"

export async function POST(req: NextRequest) {
  const user = await requireUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.DEEPGRAM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 500 }
    )
  }

  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 })
  }

  const audio = form.get("audio")
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "missing audio blob" }, { status: 400 })
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: "empty audio" }, { status: 400 })
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "audio too large" }, { status: 413 })
  }

  const lang = (form.get("lang") as string | null) ?? "en"

  const params = new URLSearchParams({
    model: DG_MODEL,
    language: lang,
    smart_format: "true",
    punctuate: "true",
  })
  const url = `https://api.deepgram.com/v1/listen?${params.toString()}`
  const contentType = audio.type || "audio/webm"

  try {
    const buf = await audio.arrayBuffer()
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: buf,
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("deepgram transcribe failed", res.status, detail)
      return NextResponse.json(
        {
          error: "transcribe-failed",
          upstreamStatus: res.status,
          upstreamBody: detail.slice(0, 500),
        },
        { status: 502 }
      )
    }
    const data = (await res.json()) as {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string }>
        }>
      }
    }
    const text =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ""
    return NextResponse.json({ text })
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error("deepgram transcribe error", err)
    return NextResponse.json(
      { error: "transcribe-failed", reason: "fetch-threw", detail: message },
      { status: 502 }
    )
  }
}
