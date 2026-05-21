import { createServiceClient } from "@/lib/db/server"
import type { Json } from "@/lib/db/types"

export type NotificationType =
  | "achievement"
  | "streak_risk"
  | "weekly_summary"
  | "lesson_completed"
  | "streak"

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
  for (const n of items) {
    const { error } = await supabase.from("notifications").insert({
      parent_id: n.parentId,
      child_id: n.childId ?? null,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      payload: (n.payload ?? {}) as Json,
    })
    // Unique index on (parent_id, child_id, type, payload.dedupe_key) — skip duplicates.
    if (error?.code === "23505") continue
    if (error) {
      console.error("insert notification failed", error)
      throw error
    }
  }
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

export function buildLessonCompletedNotification(args: {
  parentId: string
  childId: string
  childName: string
  lessonId: string
  lessonTitle: string
  stars: number
  xpEarned: number
}): NotificationInsert | null {
  return {
    parentId: args.parentId,
    childId: args.childId,
    type: "lesson_completed",
    title: `${args.childName} completed a lesson`,
    body: `${args.lessonTitle} · ${args.stars}★ · +${args.xpEarned} XP`,
    payload: {
      lesson_id: args.lessonId,
      lesson_title: args.lessonTitle,
      stars: args.stars,
      xp_earned: args.xpEarned,
      dedupe_key: `lesson:${args.lessonId}`,
    },
  }
}

export function buildStreakActivityNotification(args: {
  parentId: string
  childId: string
  childName: string
  streakDays: number
  today: string
}): NotificationInsert | null {
  const title =
    args.streakDays <= 1
      ? `${args.childName} started a streak`
      : `${args.childName} continued a ${args.streakDays}-day streak`
  const body =
    args.streakDays <= 1
      ? "First activity today — keep it going!"
      : "Streak saved for today."

  return {
    parentId: args.parentId,
    childId: args.childId,
    type: "streak",
    title,
    body,
    payload: {
      streak_days: args.streakDays,
      dedupe_key: `streak_day:${args.today}`,
    },
  }
}
