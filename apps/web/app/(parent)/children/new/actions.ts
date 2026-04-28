"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { CreateChildBody } from "@/lib/validation/schemas"

export async function createChild(formData: FormData): Promise<void> {
  const user = await requireUser()
  const parsed = CreateChildBody.safeParse({
    name: formData.get("name"),
    age: Number(formData.get("age")),
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("children")
    .insert({
      parent_id: user.id,
      name: parsed.data.name,
      age: parsed.data.age,
    })
    .select("id")
    .single()
  if (error || !data) throw new Error(error?.message ?? "Failed")

  await supabase.from("child_stats").insert({ child_id: data.id })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
