import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/db/server"
import { todayISO } from "@/lib/services/progress"
import {
  insertNotifications,
  type NotificationInsert,
} from "@/lib/services/notifications"
import { assertCron } from "../_auth"

export const dynamic = "force-dynamic"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const denied = assertCron(req)
  if (denied) return denied

  const supabase = createServiceClient()
  const since = new Date(Date.now() - WEEK_MS).toISOString()
  const today = todayISO()

  const { data: children, error } = await supabase
    .from("children")
    .select(
      "id, name, parent_id, child_stats(total_xp, streak_days, level)"
    )

  if (error) {
    console.error("weekly-summary children query failed", error)
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }

  const items: NotificationInsert[] = []
  for (const c of children ?? []) {
    const stats = Array.isArray(c.child_stats) ? c.child_stats[0] : c.child_stats

    const [{ count: lessonsThisWeek }, { count: attemptsThisWeek }, { data: newBadges }] =
      await Promise.all([
        supabase
          .from("progress")
          .select("id", { count: "exact", head: true })
          .eq("child_id", c.id)
          .gte("completed_at", since),
        supabase
          .from("exercise_attempts")
          .select("id", { count: "exact", head: true })
          .eq("child_id", c.id)
          .gte("created_at", since),
        supabase
          .from("child_badges")
          .select("awarded_at, badges(code, title, icon)")
          .eq("child_id", c.id)
          .gte("awarded_at", since),
      ])

    const lessons = lessonsThisWeek ?? 0
    const attempts = attemptsThisWeek ?? 0
    const badgeList = (newBadges ?? []).flatMap((b) => {
      const badge = Array.isArray(b.badges) ? b.badges[0] : b.badges
      return badge ? [badge] : []
    })

    const summaryParts: string[] = []
    summaryParts.push(`${lessons} lesson${lessons === 1 ? "" : "s"} completed`)
    summaryParts.push(`${attempts} exercise${attempts === 1 ? "" : "s"} attempted`)
    if (badgeList.length > 0) {
      summaryParts.push(
        `${badgeList.length} new badge${badgeList.length === 1 ? "" : "s"}`
      )
    }
    summaryParts.push(`${stats?.total_xp ?? 0} total XP`)
    summaryParts.push(`${stats?.streak_days ?? 0}-day streak`)

    items.push({
      parentId: c.parent_id,
      childId: c.id,
      type: "weekly_summary",
      title: `${c.name} — weekly progress`,
      body: summaryParts.join(" · "),
      payload: {
        lessons_completed: lessons,
        exercises_attempted: attempts,
        new_badges: badgeList,
        total_xp: stats?.total_xp ?? 0,
        streak_days: stats?.streak_days ?? 0,
        level: stats?.level ?? 1,
        dedupe_key: `weekly_summary:${today}`,
      },
    })
  }

  await insertNotifications(items)

  return NextResponse.json({ ok: true, notified: items.length })
}
