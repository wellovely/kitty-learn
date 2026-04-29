import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { GAME_TONES, pickTone, type GameColor } from "@/lib/game-palette"

export default async function AnalyticsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: children } = await supabase
    .from("children")
    .select("id, name, child_stats(total_xp, streak_days)")
    .eq("parent_id", user.id)
    .order("created_at")

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 7)
  const { data: recent } = await supabase
    .from("exercise_attempts")
    .select("is_correct, created_at, children!inner(parent_id)")
    .gte("created_at", since.toISOString())
    .eq("children.parent_id", user.id)

  const total = recent?.length ?? 0
  const correct = (recent ?? []).filter((a) => a.is_correct).length

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <section className="grid gap-3 md:grid-cols-3">
        <Stat label="Attempts (7d)" value={total} color="cyan" />
        <Stat
          label="Accuracy (7d)"
          value={total === 0 ? "—" : `${Math.round((correct / total) * 100)}%`}
          color="lime"
        />
        <Stat
          label="Active children"
          value={(children ?? []).filter((c) =>
            Array.isArray(c.child_stats)
              ? (c.child_stats[0]?.total_xp ?? 0) > 0
              : ((c.child_stats as { total_xp?: number } | null)?.total_xp ?? 0) > 0
          ).length}
          color="purple"
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Per child</h2>
        <div className="grid gap-2">
          {(children ?? []).map((c, idx) => {
            const s = Array.isArray(c.child_stats) ? c.child_stats[0] : c.child_stats
            const tone = pickTone(idx)
            return (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-2xl border-[3px] ${tone.edge} ${tone.bgSoft} px-4 py-3`}
              >
                <span className="font-bold">{c.name}</span>
                <span className={`text-sm font-bold ${tone.edgeText}`}>
                  {s?.total_xp ?? 0} XP · {s?.streak_days ?? 0}🔥
                </span>
              </div>
            )
          })}
        </div>
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
      className={`flex flex-col gap-1 rounded-3xl border-[3px] ${tone.edge} ${tone.bgSoft} ${tone.shadow} px-5 py-4`}
    >
      <span
        className={`text-[11px] font-bold uppercase tracking-[0.14em] ${tone.edgeText}`}
      >
        {label}
      </span>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
    </div>
  )
}
