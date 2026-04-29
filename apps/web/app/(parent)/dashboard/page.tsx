import Link from "next/link"
import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { Card, CardContent } from "@workspace/ui/components/card"
import { buttonVariants } from "@workspace/ui/components/button"
import { gameButtonVariants } from "@workspace/ui/components/game-button"
import { pickTone } from "@/lib/game-palette"

export default async function Dashboard() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: children } = await supabase
    .from("children")
    .select("id, name, age, child_stats(total_xp, streak_days, hearts, level)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })

  const empty = !children || children.length === 0

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Your children</h1>
        <Link
          href="/children/new"
          className={gameButtonVariants({ color: "lime", size: "sm" })}
        >
          + Add child
        </Link>
      </header>

      {empty ? (
        <Card className="border-[3px] border-dashed border-game-cyan-edge bg-game-cyan-soft/40">
          <CardContent className="py-10 text-center font-semibold text-game-cyan-edge">
            No children yet. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((c, idx) => {
            const stats = Array.isArray(c.child_stats)
              ? c.child_stats[0]
              : c.child_stats
            const tone = pickTone(idx)
            const initial = c.name?.[0]?.toUpperCase() ?? "?"
            return (
              <div
                key={c.id}
                className={`flex flex-col gap-4 rounded-3xl border-[3px] ${tone.edge} ${tone.bgSoft} ${tone.shadow} p-5`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full border-[3px] ${tone.edge} ${tone.bg} text-xl font-bold text-white`}
                  >
                    {initial}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-lg font-bold">{c.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      age {c.age}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-2 py-0.5 text-xs font-bold text-game-amber-edge">
                    ⭐ {stats?.total_xp ?? 0} XP
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border-[2px] ${tone.edge} bg-white px-2 py-0.5 text-xs font-bold ${tone.edgeText}`}>
                    Lv {stats?.level ?? 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border-[2px] border-game-red-edge bg-game-red-soft px-2 py-0.5 text-xs font-bold text-game-red-edge">
                    🔥 {stats?.streak_days ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/home?childId=${c.id}`}
                    className={gameButtonVariants({ color: "lime", size: "sm" })}
                  >
                    Play
                  </Link>
                  <Link
                    href={`/children/${c.id}`}
                    className={gameButtonVariants({ color: "neutral", size: "sm" })}
                  >
                    Progress
                  </Link>
                  <Link
                    href={`/children/${c.id}/settings`}
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
