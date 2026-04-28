import { redirect } from "next/navigation"

// Roadmap on /home supersedes per-unit pages. Redirect for backwards compat.
export default async function UnitPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>
}) {
  const { childId } = await searchParams
  redirect(childId ? `/home?childId=${childId}` : "/dashboard")
}
