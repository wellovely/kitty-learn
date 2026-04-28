"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/db/server"
import { requireRole } from "@/lib/auth/session"

const ExerciseInput = z.object({
  lessonId: z.string().uuid(),
  type: z.enum(["phonics", "handwriting", "sight_word", "vocabulary"]),
  prompt: z.string().min(1).max(500),
  answer: z.string().min(1).max(200),
  alternatives: z.string().max(500).optional(),
  orderIndex: z.coerce.number().int().min(0),
})

export async function createExercise(formData: FormData): Promise<void> {
  await requireRole("admin")
  const parsed = ExerciseInput.safeParse({
    lessonId: formData.get("lessonId"),
    type: formData.get("type"),
    prompt: formData.get("prompt"),
    answer: formData.get("answer"),
    alternatives: formData.get("alternatives") ?? undefined,
    orderIndex: formData.get("orderIndex"),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message)

  const alts = (parsed.data.alternatives ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const supabase = await createClient()
  const { error } = await supabase.from("exercises").insert({
    lesson_id: parsed.data.lessonId,
    type: parsed.data.type,
    prompt: parsed.data.prompt,
    expected: {
      answer: parsed.data.answer,
      ...(alts.length ? { alternatives: alts } : {}),
    },
    order_index: parsed.data.orderIndex,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/lessons/${parsed.data.lessonId}`)
}

export async function deleteExercise(
  exerciseId: string,
  lessonId: string
): Promise<void> {
  await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId)
  if (error) throw new Error(error.message)
  revalidatePath(`/lessons/${lessonId}`)
}

export async function deleteLesson(
  lessonId: string,
  unitId: string
): Promise<void> {
  await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId)
  if (error) throw new Error(error.message)
  revalidatePath("/units")
  void unitId
  redirect("/units")
}
