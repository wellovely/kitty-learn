import Link from "next/link"
import { notFound } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { ChildHeader } from "./_components/ChildHeader"
import { Roadmap, type RoadmapLesson } from "./_components/Roadmap"

export default async function ChildHome({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>
}) {
  const { childId } = await searchParams
  if (!childId) notFound()

  await requireUser()
  const supabase = await createClient()

  const [{ data: child }, { data: units }, { data: progress }, { data: stats }] =
    await Promise.all([
      supabase.from("children").select("id, name, age").eq("id", childId).single(),
      supabase
        .from("units")
        .select("id, title, order_index, lessons(id, title, order_index)")
        .order("order_index"),
      supabase
        .from("progress")
        .select("lesson_id, stars")
        .eq("child_id", childId),
      supabase.from("child_stats").select("*").eq("child_id", childId).maybeSingle(),
    ])
  if (!child) notFound()

  const progressByLesson = new Map<string, number>(
    (progress ?? []).map((p) => [p.lesson_id, p.stars])
  )

  const flat: RoadmapLesson[] = []
  for (const u of units ?? []) {
    const lessons = [...(u.lessons ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    )
    for (const l of lessons) {
      flat.push({
        id: l.id,
        title: l.title,
        unitTitle: u.title,
        unitOrder: u.order_index,
        stars: progressByLesson.get(l.id) ?? 0,
        locked: false, // set below
      })
    }
  }

  // Unlock rule: first is always unlocked; each next is unlocked when
  // previous has >= 1 star. Everything after the first locked stays locked.
  let lockFromHere = false
  for (let i = 0; i < flat.length; i++) {
    if (i === 0) {
      flat[i]!.locked = false
    } else if (lockFromHere) {
      flat[i]!.locked = true
    } else if ((flat[i - 1]?.stars ?? 0) < 1) {
      flat[i]!.locked = true
      lockFromHere = true
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ChildHeader
        name={child.name}
        xp={stats?.total_xp ?? 0}
        streak={stats?.streak_days ?? 0}
        hearts={stats?.hearts ?? 5}
      />
      <Link
        href={`/chat?childId=${childId}`}
        className="group flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-100 to-rose-100 px-4 py-3 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:border-amber-900/40 dark:from-amber-900/30 dark:to-rose-900/30"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md">
          <MessageCircle className="size-5" />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold">Talk to Whiskers</span>
          <span className="text-xs text-muted-foreground">
            Free voice chat — say anything!
          </span>
        </span>
        <span className="ml-auto text-amber-700 transition group-hover:translate-x-0.5 dark:text-amber-300">
          →
        </span>
      </Link>
      <Roadmap lessons={flat} childId={childId} />
    </div>
  )
}
