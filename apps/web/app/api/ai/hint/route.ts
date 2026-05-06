import { NextRequest, NextResponse } from "next/server"
import { HintBody } from "@/lib/validation/schemas"
import { requireParentOfChild } from "@/lib/auth/session"
import { getExercise } from "@/lib/services/lessons"
import { generateHint } from "@/lib/ai/hint"
import { ExpectedAnswer } from "@/lib/ai/schemas"

export async function POST(req: NextRequest) {
  const parsed = HintBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { childId, exerciseId } = parsed.data

  try {
    const child = await requireParentOfChild(childId)
    const exercise = await getExercise(exerciseId)
    const expected = ExpectedAnswer.parse(exercise.expected)

    const result = await generateHint({
      exerciseType: exercise.type as
        | "phonics"
        | "handwriting"
        | "sight_word"
        | "vocabulary"
        | "match_pairs",
      prompt: exercise.prompt,
      expected,
      childAge: child.age,
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.error("hint error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
