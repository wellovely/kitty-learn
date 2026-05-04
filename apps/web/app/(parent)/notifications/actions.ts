"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"

export async function markNotificationRead(id: string): Promise<void> {
  const user = await requireUser()
  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("parent_id", user.id)
    .is("read_at", null)
  revalidatePath("/notifications")
  revalidatePath("/dashboard")
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await requireUser()
  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("parent_id", user.id)
    .is("read_at", null)
  revalidatePath("/notifications")
  revalidatePath("/dashboard")
}
