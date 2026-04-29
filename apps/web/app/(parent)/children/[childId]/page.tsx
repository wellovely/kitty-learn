import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { requireParentOfChild } from "@/lib/auth/session"
import { gameButtonVariants } from "@workspace/ui/components/game-button"
import { GAME_TONES, type GameColor } from "@/lib/game-palette"

export default async function ChildDetail({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  let child
  try {
    child = await requireParentOfChild(childId)
  } catch {
    notFound()
  }

  const supabase = await createClient()
  const [{ data: stats }, { data: progressRows }, { data: badgeRows }] =
    await Promise.all([
      supabase.from("child_stats").select("*").eq("child_id", childId).maybeSingle(),
      supabase
        .from("progress")
        .select("stars, xp_earned, completed_at, lessons(title)")
        .eq("child_id", childId)
        .order("completed_at", { ascending: false })
        .limit(10),
      supabase
        .from("child_badges")
        .select("awarded_at, badges(code, title, icon)")
        .eq("child_id", childId)
        .order("awarded_at", { ascending: false }),
    ])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-bold text-game-cyan-edge underline-offset-4 hover:underline"
          >
            ← Back
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{child.name}</h1>
          <p className="text-muted-foreground text-sm">Age {child.age}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/home?childId=${childId}`}
            className={gameButtonVariants({ color: "lime", size: "md" })}
          >
            Open child mode
          </Link>
          <Link
            href={`/children/${childId}/settings`}
            className={gameButtonVariants({ color: "neutral", size: "md" })}
          >
            Settings
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Total XP" value={stats?.total_xp ?? 0} color="amber" />
        <Stat label="Level" value={stats?.level ?? 1} color="cyan" />
        <Stat label="Streak" value={`${stats?.streak_days ?? 0} 🔥`} color="red" />
        <Stat label="Hearts" value={`${stats?.hearts ?? 5} ❤️`} color="lime" />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Recent lessons</h2>
        {(progressRows ?? []).length === 0 ? (
          <div className="rounded-2xl border-[3px] border-dashed border-game-cyan-edge bg-game-cyan-soft/40 py-6 text-center text-sm font-semibold text-game-cyan-edge">
            No lessons completed yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {progressRows!.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border-[2px] border-game-cyan-edge bg-game-cyan-soft px-4 py-3"
              >
                <span className="font-semibold">{row.lessons?.title ?? "Lesson"}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span>{"⭐".repeat(row.stars)}</span>
                  <span className="rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-2 py-0.5 text-xs font-bold text-game-amber-edge">
                    +{row.xp_earned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Badges</h2>
        {(badgeRows ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">None yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badgeRows!.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-game-purple-edge bg-game-purple-soft px-3 py-1 text-sm font-bold text-game-purple-edge"
              >
                <span>{b.badges?.icon}</span>
                <span>{b.badges?.title}</span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: GameColor
}) {
  const tone = GAME_TONES[color]
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border-[3px] ${tone.edge} ${tone.bgSoft} px-4 py-3`}
    >
      <span
        className={`text-[11px] font-bold uppercase tracking-[0.14em] ${tone.edgeText}`}
      >
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  )
}
