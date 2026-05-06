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

const MatchPair = z.object({
  left: z.string().min(1).max(80),
  right: z.string().min(1).max(80),
})

const ExerciseInput = z.object({
  lessonId: z.string().uuid(),
  type: z.enum([
    "phonics",
    "handwriting",
    "sight_word",
    "vocabulary",
    "match_pairs",
  ]),
  prompt: z.string().min(1).max(500),
  answer: z.string().max(200).optional(),
  alternatives: z.string().max(500).optional(),
  orderIndex: z.coerce.number().int().min(0),
  voiceOnly: z
    .union([z.literal("on"), z.literal("true"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  imageUrl: optionalUrl,
  audioUrl: optionalUrl,
  pairs: z.string().max(2000).optional(),
})

export async function createExercise(formData: FormData): Promise<void> {
  await requireRole("admin")
  const parsed = ExerciseInput.safeParse({
    lessonId: formData.get("lessonId"),
    type: formData.get("type"),
    prompt: formData.get("prompt"),
    answer: formData.get("answer") ?? undefined,
    alternatives: formData.get("alternatives") ?? undefined,
    orderIndex: formData.get("orderIndex"),
    voiceOnly: formData.get("voiceOnly") ?? undefined,
    imageUrl: formData.get("imageUrl") ?? undefined,
    audioUrl: formData.get("audioUrl") ?? undefined,
    pairs: formData.get("pairs") ?? undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message)

  const isMatchPairs = parsed.data.type === "match_pairs"

  let pairsParsed: { left: string; right: string }[] | undefined
  if (isMatchPairs) {
    const raw = (parsed.data.pairs ?? "").trim()
    if (!raw) throw new Error("Pairs JSON is required for match_pairs")
    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      throw new Error("Pairs JSON is not valid JSON")
    }
    const result = z.array(MatchPair).min(2).max(8).safeParse(json)
    if (!result.success) {
      throw new Error("Pairs JSON must be an array of 2–8 { left, right } items")
    }
    pairsParsed = result.data
  }

  const answer = isMatchPairs
    ? "match_complete"
    : (parsed.data.answer ?? "").trim()
  if (!isMatchPairs && !answer) {
    throw new Error("Expected answer is required")
  }

  const alts = (parsed.data.alternatives ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const expected: {
    answer: string
    alternatives?: string[]
    voiceOnly?: boolean
    pairs?: { left: string; right: string }[]
  } = { answer }
  if (!isMatchPairs && alts.length) expected.alternatives = alts
  if (!isMatchPairs && parsed.data.voiceOnly) expected.voiceOnly = true
  if (isMatchPairs && pairsParsed) expected.pairs = pairsParsed

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
