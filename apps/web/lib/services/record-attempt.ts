import { createClient } from "@/lib/db/server"
import type { EvaluationResult } from "@/lib/ai/schemas"

export async function recordAttempt(args: {
  childId: string
  exerciseId: string
  answer: string
  result: EvaluationResult
}) {
  const supabase = await createClient()
  await supabase.from("exercise_attempts").insert({
    child_id: args.childId,
    exercise_id: args.exerciseId,
    answer: args.answer,
    is_correct: args.result.isCorrect,
    ai_feedback: args.result.feedback,
  })
}
