import { generateObject } from "ai"
import { model } from "./client"
import {
  EvaluationResult,
  type ExerciseType,
  type ExpectedAnswer,
} from "./schemas"

const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,]/g, "")

function exactMatch(answer: string, expected: ExpectedAnswer) {
  const target = normalize(answer)
  if (normalize(expected.answer) === target) return true
  return (expected.alternatives ?? []).some((a: string) => normalize(a) === target)
}

export async function evaluateAnswer(args: {
  exerciseType: ExerciseType
  prompt: string
  expected: ExpectedAnswer
  answer: string
  childAge: number
}): Promise<EvaluationResult> {
  if (exactMatch(args.answer, args.expected)) {
    return {
      isCorrect: true,
      score: 1,
      feedback: "Purr-fect! You got it!",
      emotion: "excited",
      suggestedDifficultyDelta: "0",
    }
  }

  const { object } = await generateObject({
    model,
    schema: EvaluationResult,
    system:
      "You are a warm grey-kitten tutor for children aged 3–8. " +
      "Use 1 short sentence. Praise effort. Never use the word 'wrong'. " +
      "If the answer is off, be tolerant of spelling and phonetic mistakes.",
    prompt: [
      `Exercise type: ${args.exerciseType}`,
      `Exercise prompt: ${args.prompt}`,
      `Expected answer: ${args.expected.answer}`,
      `Alternatives: ${(args.expected.alternatives ?? []).join(", ") || "(none)"}`,
      `Child age: ${args.childAge}`,
      `Child answered: "${args.answer}"`,
      "Evaluate tolerantly. Return structured result.",
    ].join("\n"),
  })
  return object
}
