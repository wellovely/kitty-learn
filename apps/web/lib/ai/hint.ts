import { generateObject } from "ai"
import { model } from "./client"
import { HintResult, type ExpectedAnswer, type ExerciseType } from "./schemas"

export async function generateHint(args: {
  exerciseType: ExerciseType
  prompt: string
  expected: ExpectedAnswer
  childAge: number
}): Promise<HintResult> {
  const { object } = await generateObject({
    model,
    schema: HintResult,
    system:
      "You are a warm grey-kitten tutor for children aged 3–8. " +
      "Give ONE short playful hint. Do NOT reveal the answer. " +
      "Use sounds, shapes, or the first letter as clues.",
    prompt: [
      `Exercise type: ${args.exerciseType}`,
      `Exercise prompt: ${args.prompt}`,
      `Expected answer (secret, do NOT say it): ${args.expected.answer}`,
      `Child age: ${args.childAge}`,
    ].join("\n"),
  })
  return object
}
