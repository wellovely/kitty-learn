import { NextRequest, NextResponse } from "next/server"
import { EvaluateBody } from "@/lib/validation/schemas"
import { requireParentOfChild } from "@/lib/auth/session"
import { getExercise } from "@/lib/services/lessons"
import { evaluateAnswer } from "@/lib/ai/evaluate"
import { recordAttempt } from "@/lib/services/record-attempt"
import { ExpectedAnswer } from "@/lib/ai/schemas"

export async function POST(req: NextRequest) {
  const parsed = EvaluateBody.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { childId, exerciseId, answer } = parsed.data

  try {
    const child = await requireParentOfChild(childId)
    const exercise = await getExercise(exerciseId)
    const expected = ExpectedAnswer.parse(exercise.expected)

    const result = await evaluateAnswer({
      exerciseType: exercise.type as
        | "phonics"
        | "handwriting"
        | "sight_word"
        | "vocabulary",
      prompt: exercise.prompt,
      expected,
      answer,
      childAge: child.age,
    })

    await recordAttempt({ childId, exerciseId, answer, result })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.error("evaluate error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
