import { NextRequest, NextResponse } from "next/server"
import { ChatBody } from "@/lib/validation/schemas"
import { requireParentOfChild } from "@/lib/auth/session"
import { QUIZ_SENTINEL, extractQuiz, streamChatReply } from "@/lib/ai/chat"

export async function POST(req: NextRequest) {
  const parsed = ChatBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { childId, message, history } = parsed.data

  try {
    const child = await requireParentOfChild(childId)

    const userMsgsBefore = history.filter((m) => m.role === "user").length
    const userMsgIndex = userMsgsBefore + 1
    const wantQuiz = userMsgIndex >= 3 && userMsgIndex % 3 === 0

    const result = streamChatReply({
      childName: child.name,
      childAge: child.age,
      history,
      message,
      includeQuiz: wantQuiz,
    })

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder()
        let full = ""
        try {
          for await (const chunk of result.textStream) {
            full += chunk
            controller.enqueue(enc.encode(chunk))
          }
          if (wantQuiz) {
            const quiz = await extractQuiz({
              assistantText: full,
              childAge: child.age,
            })
            if (quiz) {
              controller.enqueue(
                enc.encode("\n" + QUIZ_SENTINEL + JSON.stringify(quiz)),
              )
            }
          }
        } catch (err) {
          console.error("chat stream error", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    if (err instanceof Response) return err
    console.error("chat error", err)
    const detail =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    return NextResponse.json({ error: "internal", detail }, { status: 500 })
  }
}
