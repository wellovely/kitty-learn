import { requireRole } from "@/lib/auth/session"
import { getGlobalLeaderboard } from "@/lib/services/leaderboard"
import { Card, CardContent } from "@workspace/ui/components/card"
import { LeaderboardPodium } from "./_components/LeaderboardPodium"
import { LeaderboardTable } from "./_components/LeaderboardTable"

export default async function LeaderboardPage() {
  const profile = await requireRole("parent")
  const entries = await getGlobalLeaderboard({ parentId: profile.id, limit: 50 })
  const hasXp = entries.some((e) => e.totalXp > 0)
  const empty = entries.length === 0 || !hasXp

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Top 50 learners by total XP across Kitty Learn
        </p>
      </header>

      {empty ? (
        <Card className="border-[3px] border-dashed border-game-amber-edge bg-game-amber-soft/40">
          <CardContent className="py-12 text-center">
            <p className="text-4xl" aria-hidden>
              🏆
            </p>
            <p className="mt-3 font-bold text-game-amber-edge">
              No one has earned XP yet
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              When children complete lessons, rankings will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <LeaderboardPodium entries={entries} />
          <LeaderboardTable entries={entries} />
        </>
      )}
    </div>
  )
}
