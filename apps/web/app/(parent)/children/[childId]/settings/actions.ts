"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { requireParentOfChild } from "@/lib/auth/session"
import { z } from "zod"

const UpdateChild = z.object({
  name: z.string().min(1).max(50),
  age: z.coerce.number().int().min(3).max(10),
})

export async function updateChild(
  childId: string,
  formData: FormData
): Promise<void> {
  await requireParentOfChild(childId)
  const parsed = UpdateChild.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
  }
  const supabase = await createClient()
  const { error } = await supabase
    .from("children")
    .update(parsed.data)
    .eq("id", childId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard")
  revalidatePath(`/children/${childId}`)
  redirect(`/children/${childId}`)
}

export async function deleteChild(childId: string): Promise<void> {
  await requireParentOfChild(childId)
  const supabase = await createClient()
  const { error } = await supabase.from("children").delete().eq("id", childId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard")
  redirect("/dashboard")
}
