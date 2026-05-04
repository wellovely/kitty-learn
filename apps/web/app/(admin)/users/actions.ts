"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient, createServiceClient } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"
import { requireRole } from "@/lib/auth/session"

export type AdminUserRow = {
  id: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
}

async function adminProfileCount(
  service: SupabaseClient<Database>
): Promise<number> {
  const { count, error } = await service
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
  if (error) throw new Error(error.message)
  return count ?? 0
}

async function fetchAuthEmailsByUserId(
  service: SupabaseClient<Database>
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  let page = 1
  const perPage = 1000
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(error.message)
    for (const u of data.users) {
      if (u.email) map.set(u.id, u.email)
    }
    if (data.users.length < perPage) break
    page += 1
    if (page > 100) break
  }
  return map
}

export async function loadAdminUsers(): Promise<AdminUserRow[]> {
  await requireRole("admin")
  const supabase = await createClient()
  const service = createServiceClient()

  const [{ data: profiles, error: profilesError }, emailById] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false }),
    fetchAuthEmailsByUserId(service),
  ])

  if (profilesError) throw new Error(profilesError.message)

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emailById.get(p.id) ?? null,
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
  }))
}

const UpdateUser = z.object({
  userId: z.string().uuid(),
  role: z.enum(["parent", "admin"]),
  fullName: z
    .string()
    .max(200)
    .transform((s) => s.trim() || null),
})

export async function updateUserProfile(formData: FormData): Promise<void> {
  const me = await requireRole("admin")
  const parsed = UpdateUser.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    fullName: formData.get("fullName") ?? "",
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input")

  const service = createServiceClient()
  const { data: target, error: readErr } = await service
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.userId)
    .single()
  if (readErr || !target) throw new Error(readErr?.message ?? "User not found")

  if (parsed.data.userId === me.id && parsed.data.role !== target.role) {
    throw new Error("You can't change your own role")
  }

  if (target.role === "admin" && parsed.data.role === "parent") {
    const n = await adminProfileCount(service)
    if (n < 2) throw new Error("Cannot remove the last admin")
  }

  const { error } = await service
    .from("profiles")
    .update({
      role: parsed.data.role,
      full_name: parsed.data.fullName,
    })
    .eq("id", parsed.data.userId)
  if (error) throw new Error(error.message)
  revalidatePath("/users")
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const me = await requireRole("admin")
  const id = z.string().uuid().safeParse(userId)
  if (!id.success) throw new Error("Invalid user id")
  if (id.data === me.id) throw new Error("Cannot delete your own account")

  const service = createServiceClient()
  const { data: target, error: readErr } = await service
    .from("profiles")
    .select("role")
    .eq("id", id.data)
    .single()
  if (readErr || !target) throw new Error(readErr?.message ?? "User not found")

  if (target.role === "admin") {
    const n = await adminProfileCount(service)
    if (n < 2) throw new Error("Cannot delete the last admin")
  }

  const { error } = await service.auth.admin.deleteUser(id.data)
  if (error) throw new Error(error.message)
  revalidatePath("/users")
}
