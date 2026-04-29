"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/db/server"
import { requireRole } from "@/lib/auth/session"

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\//.test(v), {
    message: "Must be an http(s) URL",
  })

const ExerciseInput = z.object({
  lessonId: z.string().uuid(),
  type: z.enum(["phonics", "handwriting", "sight_word", "vocabulary"]),
  prompt: z.string().min(1).max(500),
  answer: z.string().min(1).max(200),
  alternatives: z.string().max(500).optional(),
  orderIndex: z.coerce.number().int().min(0),
  voiceOnly: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  imageUrl: optionalUrl,
  audioUrl: optionalUrl,
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
    voiceOnly: formData.get("voiceOnly") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    audioUrl: formData.get("audioUrl") ?? undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message)

  const alts = (parsed.data.alternatives ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const expected: {
    answer: string
    alternatives?: string[]
    voiceOnly?: boolean
  } = { answer: parsed.data.answer }
  if (alts.length) expected.alternatives = alts
  if (parsed.data.voiceOnly) expected.voiceOnly = true

  const assets: { imageUrl?: string; audioUrl?: string } = {}
  if (parsed.data.imageUrl) assets.imageUrl = parsed.data.imageUrl
  if (parsed.data.audioUrl) assets.audioUrl = parsed.data.audioUrl

  const supabase = await createClient()
  const { error } = await supabase.from("exercises").insert({
    lesson_id: parsed.data.lessonId,
    type: parsed.data.type,
    prompt: parsed.data.prompt,
    expected,
    order_index: parsed.data.orderIndex,
    ...(Object.keys(assets).length ? { assets } : {}),
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
