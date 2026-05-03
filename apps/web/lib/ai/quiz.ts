import { z } from "zod"

export const QUIZ_SENTINEL = "<<<QUIZ>>>"

export const QuizSchema = z.object({
  options: z.array(z.string().min(1).max(40)).length(3),
  correctIndex: z.number().int().min(0).max(2),
  feedback: z
    .object({
      correct: z.string().max(140).optional(),
      wrong: z.string().max(140).optional(),
    })
    .optional(),
})
export type Quiz = z.infer<typeof QuizSchema>
