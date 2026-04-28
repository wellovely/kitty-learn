import { NextRequest, NextResponse } from "next/server"
import { ChatBody } from "@/lib/validation/schemas"
import { requireParentOfChild } from "@/lib/auth/session"
import { generateChatReply } from "@/lib/ai/chat"

export async function POST(req: NextRequest) {
  const parsed = ChatBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { childId, message, history } = parsed.data

  try {
    const child = await requireParentOfChild(childId)
    const result = await generateChatReply({
      childName: child.name,
      childAge: child.age,
      history,
      message,
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.error("chat error", err)
    const detail =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    return NextResponse.json({ error: "internal", detail }, { status: 500 })
  }
}
