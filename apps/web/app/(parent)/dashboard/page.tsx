import Link from "next/link"
import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"

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
        <Link href="/children/new" className={buttonVariants()}>
          + Add child
        </Link>
      </header>

      {empty ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No children yet. Add one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((c) => {
            const stats = Array.isArray(c.child_stats)
              ? c.child_stats[0]
              : c.child_stats
            return (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground text-sm">
                      age {c.age}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      ⭐ {stats?.total_xp ?? 0} XP
                    </Badge>
                    <Badge variant="secondary">
                      Lv {stats?.level ?? 1}
                    </Badge>
                    <Badge variant="secondary">
                      🔥 {stats?.streak_days ?? 0}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/home?childId=${c.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Play
                    </Link>
                    <Link
                      href={`/children/${c.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
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
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
