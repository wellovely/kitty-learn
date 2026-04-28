import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth/session"

const DG_URL = "https://api.deepgram.com/v1/speak"
const DEFAULT_VOICE = "aura-2-thalia-en"

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

  const body = (await req.json().catch(() => null)) as
    | { text?: string; voice?: string }
    | null
  const text = body?.text?.trim()
  if (!text) {
    return NextResponse.json({ error: "missing text" }, { status: 400 })
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "text too long" }, { status: 413 })
  }

  const voice = body?.voice?.trim() || DEFAULT_VOICE
  const params = new URLSearchParams({
    model: voice,
    encoding: "mp3",
  })

  try {
    const res = await fetch(`${DG_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("deepgram speak failed", res.status, detail)
      return NextResponse.json(
        {
          error: "speak-failed",
          upstreamStatus: res.status,
          upstreamBody: detail.slice(0, 500),
        },
        { status: 502 }
      )
    }
    const audio = await res.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    console.error("deepgram speak error", err)
    return NextResponse.json(
      { error: "speak-failed", reason: "fetch-threw", detail: message },
      { status: 502 }
    )
  }
}
