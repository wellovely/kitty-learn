import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { requireParentOfChild } from "@/lib/auth/session"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"

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
      <header className="flex items-end justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground text-sm underline">
            ← Back
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{child.name}</h1>
          <p className="text-muted-foreground text-sm">Age {child.age}</p>
        </div>
        <Link
          href={`/home?childId=${childId}`}
          className={buttonVariants()}
        >
          Open child mode
        </Link>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Total XP" value={stats?.total_xp ?? 0} />
        <Stat label="Level" value={stats?.level ?? 1} />
        <Stat label="Streak" value={`${stats?.streak_days ?? 0} 🔥`} />
        <Stat label="Hearts" value={`${stats?.hearts ?? 5} ❤️`} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Recent lessons</h2>
        {(progressRows ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground text-sm">
              No lessons completed yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {progressRows!.map((row, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between py-3">
                  <span>{row.lessons?.title ?? "Lesson"}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span>{"⭐".repeat(row.stars)}</span>
                    <Badge variant="secondary">+{row.xp_earned} XP</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Badges</h2>
        {(badgeRows ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">None yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badgeRows!.map((b, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                <span>{b.badges?.icon}</span>
                <span>{b.badges?.title}</span>
              </Badge>
            ))}
          </div>
        )}
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
