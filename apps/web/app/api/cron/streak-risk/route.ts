import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/db/server"
import { todayISO } from "@/lib/services/progress"
import { insertNotifications } from "@/lib/services/notifications"
import { assertCron } from "../_auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const denied = assertCron(req)
  if (denied) return denied

  const supabase = createServiceClient()
  const today = todayISO()

  const { data: rows, error } = await supabase
    .from("child_stats")
    .select(
      "child_id, streak_days, last_active_on, children!inner(id, name, parent_id)"
    )
    .gte("streak_days", 1)
    .or(`last_active_on.is.null,last_active_on.lt.${today}`)

  if (error) {
    console.error("streak-risk query failed", error)
    return NextResponse.json({ error: "query_failed" }, { status: 500 })
  }

  const items = (rows ?? []).flatMap((r) => {
    const child = Array.isArray(r.children) ? r.children[0] : r.children
    if (!child) return []
    return [
      {
        parentId: child.parent_id,
        childId: child.id,
        type: "streak_risk" as const,
        title: `${child.name}'s ${r.streak_days}-day streak is at risk`,
        body: "No activity yet today — a quick lesson keeps the streak alive.",
        payload: {
          streak_days: r.streak_days,
          last_active_on: r.last_active_on,
          dedupe_key: `streak_risk:${today}`,
        },
      },
    ]
  })

  await insertNotifications(items)

  return NextResponse.json({ ok: true, notified: items.length })
}
