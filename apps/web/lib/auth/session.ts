import { redirect } from "next/navigation"
import { createClient } from "@/lib/db/server"

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getUser()
  if (!user) redirect("/login")
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single()
  return data
}

export async function requireRole(role: "parent" | "admin") {
  const profile = await getProfile()
  if (!profile) redirect("/login")
  if (profile.role !== role && profile.role !== "admin") redirect("/")
  return profile
}

export async function requireParentOfChild(childId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Response("Unauthorized", { status: 401 })

  const { data: child, error } = await supabase
    .from("children")
    .select("id, parent_id, name, age")
    .eq("id", childId)
    .single()
  if (error || !child) throw new Response("Not found", { status: 404 })
  if (child.parent_id !== user.id) {
    throw new Response("Forbidden", { status: 403 })
  }
  return child
}
