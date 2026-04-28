import { redirect } from "next/navigation"
import { getProfile } from "@/lib/auth/session"

export default async function Page() {
  const profile = await getProfile()
  if (!profile) redirect("/login")
  if (profile.role === "admin") redirect("/units")
  redirect("/dashboard")
}
