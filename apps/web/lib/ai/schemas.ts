import { z } from "zod"

export const Emotion = z.enum([
  "idle",
  "happy",
  "sad",
  "thinking",
  "excited",
  "confused",
])
export type Emotion = z.infer<typeof Emotion>

export const ExerciseType = z.enum([
  "phonics",
  "handwriting",
  "sight_word",
  "vocabulary",
])
export type ExerciseType = z.infer<typeof ExerciseType>

export const EvaluationResult = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(1),
  feedback: z.string().min(1).max(200),
  hint: z.string().max(160).optional(),
  emotion: Emotion,
  suggestedDifficultyDelta: z.enum(["-1", "0", "+1"]).default("0"),
})
export type EvaluationResult = z.infer<typeof EvaluationResult>

export const HintResult = z.object({
  hint: z.string().min(1).max(160),
  emotion: Emotion,
})
export type HintResult = z.infer<typeof HintResult>

export const ChatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(500),
})
export type ChatMessage = z.infer<typeof ChatMessage>

export const ChatReply = z.object({
  reply: z.string().min(1).max(360),
  emotion: Emotion,
})
export type ChatReply = z.infer<typeof ChatReply>

export const ExpectedAnswer = z.object({
  answer: z.string(),
  alternatives: z.array(z.string()).optional(),
  letters: z.array(z.string()).optional(),
  voiceOnly: z.boolean().optional(),
})
export type ExpectedAnswer = z.infer<typeof ExpectedAnswer>

export const ExerciseAssets = z.object({
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
})
export type ExerciseAssets = z.infer<typeof ExerciseAssets>
