import { createServiceClient } from "@/lib/db/server"

export type LeaderboardEntry = {
  rank: number
  childId: string
  name: string
  age: number
  avatarUrl: string | null
  totalXp: number
  level: number
  streakDays: number
  isMine: boolean
}

type ChildRow = {
  id: string
  name: string
  age: number
  avatar_url: string | null
  parent_id: string
}

type StatsRow = {
  total_xp: number
  level: number
  streak_days: number
  updated_at: string
  children: ChildRow | ChildRow[] | null
}

function assignCompetitionRanks(
  rows: Omit<LeaderboardEntry, "rank">[]
): LeaderboardEntry[] {
  let rank = 0
  let prevXp: number | null = null
  return rows.map((row, index) => {
    if (prevXp !== row.totalXp) {
      rank = index + 1
      prevXp = row.totalXp
    }
    return { ...row, rank }
  })
}

export async function getGlobalLeaderboard(args: {
  parentId: string
  limit?: number
}): Promise<LeaderboardEntry[]> {
  const limit = Math.min(Math.max(args.limit ?? 50, 1), 50)
  const supabase = createServiceClient()

  const [{ data: statsRows, error: statsError }, { data: mineRows, error: mineError }] =
    await Promise.all([
      supabase
        .from("child_stats")
        .select(
          "total_xp, level, streak_days, updated_at, children(id, name, age, avatar_url, parent_id)"
        )
        .order("total_xp", { ascending: false })
        .order("streak_days", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(limit),
      supabase.from("children").select("id").eq("parent_id", args.parentId),
    ])

  if (statsError) {
    console.error("leaderboard stats query failed", statsError)
    throw new Error("leaderboard_query_failed")
  }
  if (mineError) {
    console.error("leaderboard mine query failed", mineError)
    throw new Error("leaderboard_query_failed")
  }

  const mineIds = new Set((mineRows ?? []).map((c) => c.id))

  const mapped = (statsRows ?? [])
    .map((row) => {
      const stats = row as StatsRow
      const child = Array.isArray(stats.children)
        ? stats.children[0]
        : stats.children
      if (!child) return null

      return {
        childId: child.id,
        name: child.name,
        age: child.age,
        avatarUrl: child.avatar_url,
        totalXp: stats.total_xp,
        level: stats.level,
        streakDays: stats.streak_days,
        isMine: mineIds.has(child.id),
      }
    })
    .filter((row): row is Omit<LeaderboardEntry, "rank"> => row !== null)

  return assignCompetitionRanks(mapped)
}
