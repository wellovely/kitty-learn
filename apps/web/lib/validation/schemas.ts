import { z } from "zod"

export const EvaluateBody = z.object({
  childId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  answer: z.string().min(1).max(200),
})
export type EvaluateBody = z.infer<typeof EvaluateBody>

export const ChatBody = z.object({
  childId: z.string().uuid(),
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      })
    )
    .max(20)
    .default([]),
})
export type ChatBody = z.infer<typeof ChatBody>

export const HintBody = z.object({
  childId: z.string().uuid(),
  exerciseId: z.string().uuid(),
})
export type HintBody = z.infer<typeof HintBody>

export const SubmitProgressBody = z.object({
  childId: z.string().uuid(),
  lessonId: z.string().uuid(),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
})
export type SubmitProgressBody = z.infer<typeof SubmitProgressBody>

export const CreateChildBody = z.object({
  name: z.string().min(1).max(50),
  age: z.number().int().min(3).max(10),
})

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const SignupBody = z.object({
  fullName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6),
})
