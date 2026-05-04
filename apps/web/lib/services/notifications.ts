import { createServiceClient } from "@/lib/db/server"
import type { Json } from "@/lib/db/types"

export type NotificationType =
  | "achievement"
  | "streak_risk"
  | "weekly_summary"

export type NotificationInsert = {
  parentId: string
  childId?: string | null
  type: NotificationType
  title: string
  body?: string | null
  payload?: Record<string, Json>
}

export async function insertNotifications(items: NotificationInsert[]) {
  if (items.length === 0) return
  const supabase = createServiceClient()
  const rows = items.map((n) => ({
    parent_id: n.parentId,
    child_id: n.childId ?? null,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    payload: (n.payload ?? {}) as Json,
  }))
  await supabase
    .from("notifications")
    .upsert(rows, {
      onConflict: "parent_id,child_id,type,((payload->>'dedupe_key'))",
      ignoreDuplicates: true,
    })
}

export function buildAchievementNotifications(args: {
  parentId: string
  childId: string
  childName: string
  newBadges: { code: string; title: string; icon: string }[]
  priorLevel: number
  newLevel: number
  newTotalXp: number
}): NotificationInsert[] {
  const out: NotificationInsert[] = []

  for (const b of args.newBadges) {
    out.push({
      parentId: args.parentId,
      childId: args.childId,
      type: "achievement",
      title: `${args.childName} earned a badge: ${b.title}`,
      body: `${b.icon} ${b.title}`,
      payload: {
        kind: "badge",
        badge_code: b.code,
        badge_title: b.title,
        badge_icon: b.icon,
        total_xp: args.newTotalXp,
        dedupe_key: `badge:${b.code}`,
      },
    })
  }

  if (args.newLevel > args.priorLevel) {
    out.push({
      parentId: args.parentId,
      childId: args.childId,
      type: "achievement",
      title: `${args.childName} reached level ${args.newLevel}`,
      body: `Total XP: ${args.newTotalXp}`,
      payload: {
        kind: "level_up",
        prior_level: args.priorLevel,
        new_level: args.newLevel,
        total_xp: args.newTotalXp,
        dedupe_key: `level:${args.newLevel}`,
      },
    })
  }

  return out
}
