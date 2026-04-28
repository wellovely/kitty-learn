"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/db/server"
import { requireRole } from "@/lib/auth/session"

const CreateUnit = z.object({
  title: z.string().min(1).max(100),
  orderIndex: z.coerce.number().int().min(0),
  minAge: z.coerce.number().int().min(3).max(10),
})

export async function createUnit(formData: FormData): Promise<void> {
  await requireRole("admin")
  const parsed = CreateUnit.safeParse({
    title: formData.get("title"),
    orderIndex: formData.get("orderIndex"),
    minAge: formData.get("minAge"),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message)
  const supabase = await createClient()
  const { error } = await supabase.from("units").insert({
    title: parsed.data.title,
    order_index: parsed.data.orderIndex,
    min_age: parsed.data.minAge,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/units")
}

export async function deleteUnit(unitId: string): Promise<void> {
  await requireRole("admin")
  const supabase = await createClient()
  const { error } = await supabase.from("units").delete().eq("id", unitId)
  if (error) throw new Error(error.message)
  revalidatePath("/units")
}

const CreateLesson = z.object({
  unitId: z.string().uuid(),
  title: z.string().min(1).max(100),
  orderIndex: z.coerce.number().int().min(0),
})

export async function createLesson(formData: FormData): Promise<void> {
  await requireRole("admin")
  const parsed = CreateLesson.safeParse({
    unitId: formData.get("unitId"),
    title: formData.get("title"),
    orderIndex: formData.get("orderIndex"),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      unit_id: parsed.data.unitId,
      title: parsed.data.title,
      order_index: parsed.data.orderIndex,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(error?.message ?? "Failed")
  revalidatePath("/units")
  redirect(`/lessons/${data.id}`)
}
