import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

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
        <Stat label="Attempts (7d)" value={total} />
        <Stat
          label="Accuracy (7d)"
          value={total === 0 ? "—" : `${Math.round((correct / total) * 100)}%`}
        />
        <Stat
          label="Active children"
          value={(children ?? []).filter((c) =>
            Array.isArray(c.child_stats)
              ? (c.child_stats[0]?.total_xp ?? 0) > 0
              : ((c.child_stats as { total_xp?: number } | null)?.total_xp ?? 0) > 0
          ).length}
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Per child</h2>
        <div className="grid gap-2">
          {(children ?? []).map((c) => {
            const s = Array.isArray(c.child_stats) ? c.child_stats[0] : c.child_stats
            return (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <span>{c.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {s?.total_xp ?? 0} XP · {s?.streak_days ?? 0}🔥
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  )
}
