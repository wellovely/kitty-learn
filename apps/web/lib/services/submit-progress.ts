import { createClient } from "@/lib/db/server"
import { requireParentOfChild } from "@/lib/auth/session"
import {
  calculateStars,
  calculateXp,
  todayISO,
  updateStreak,
  xpToLevel,
  type Stars,
} from "./progress"
import {
  computeEarnedBadges,
  type BadgeCode,
} from "./gamification"
import {
  buildAchievementNotifications,
  insertNotifications,
} from "./notifications"
import { checkLessonAccess } from "./lesson-access"

export type SubmitProgressResult = {
  stars: Stars
  xpEarned: number
  totalXp: number
  level: number
  streakDays: number
  newBadges: { code: BadgeCode; title: string; icon: string }[]
}

export async function submitProgress(args: {
  childId: string
  lessonId: string
  correctCount: number
  totalCount: number
}): Promise<SubmitProgressResult> {
  const child = await requireParentOfChild(args.childId)

  const access = await checkLessonAccess({
    childId: args.childId,
    lessonId: args.lessonId,
  })
  if (access === "not_found") {
    throw new Response("Lesson not found", { status: 404 })
  }
  if (access === "locked") {
    throw new Response("Lesson is locked", { status: 403 })
  }

  const supabase = await createClient()

  const stars = calculateStars(args.correctCount, args.totalCount)

  const { data: prior } = await supabase
    .from("progress")
    .select("stars, xp_earned, attempts")
    .eq("child_id", args.childId)
    .eq("lesson_id", args.lessonId)
    .maybeSingle()
  const firstTime = !prior
  const xpEarned = calculateXp(stars, firstTime)

  await supabase.from("progress").upsert(
    {
      child_id: args.childId,
      lesson_id: args.lessonId,
      stars: Math.max(stars, (prior?.stars ?? 0) as number),
      xp_earned: (prior?.xp_earned ?? 0) + xpEarned,
      attempts: (prior?.attempts ?? 0) + 1,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "child_id,lesson_id" }
  )

  const { data: stats } = await supabase
    .from("child_stats")
    .select("*")
    .eq("child_id", args.childId)
    .maybeSingle()

  const today = todayISO()
  const newStreak = updateStreak(
    stats?.last_active_on ?? null,
    today,
    stats?.streak_days ?? 0
  )
  const newTotalXp = (stats?.total_xp ?? 0) + xpEarned
  const priorLevel = stats?.level ?? 1
  const newLevel = xpToLevel(newTotalXp)

  await supabase.from("child_stats").upsert(
    {
      child_id: args.childId,
      total_xp: newTotalXp,
      level: newLevel,
      hearts: stats?.hearts ?? 5,
      streak_days: newStreak,
      last_active_on: today,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id" }
  )

  const { count: lessonsCount } = await supabase
    .from("progress")
    .select("lesson_id", { count: "exact", head: true })
    .eq("child_id", args.childId)

  const { data: earnedRows } = await supabase
    .from("child_badges")
    .select("badge_id, badges(code)")
    .eq("child_id", args.childId)
  const alreadyEarned = new Set<BadgeCode>(
    (earnedRows ?? [])
      .map((r) => r.badges?.code as BadgeCode | undefined)
      .filter((c): c is BadgeCode => !!c)
  )

  const toAward = computeEarnedBadges({
    isFirstLessonEver: (lessonsCount ?? 0) === 1,
    stars,
    streakDays: newStreak,
    totalXp: newTotalXp,
    alreadyEarned,
  })

  const newBadges: SubmitProgressResult["newBadges"] = []
  if (toAward.length > 0) {
    const { data: badgeRows } = await supabase
      .from("badges")
      .select("id, code, title, icon")
      .in("code", toAward)
    if (badgeRows?.length) {
      await supabase.from("child_badges").insert(
        badgeRows.map((b) => ({
          child_id: args.childId,
          badge_id: b.id,
        }))
      )
      for (const b of badgeRows) {
        newBadges.push({ code: b.code as BadgeCode, title: b.title, icon: b.icon })
      }
    }
  }

  await insertNotifications(
    buildAchievementNotifications({
      parentId: child.parent_id,
      childId: child.id,
      childName: child.name,
      newBadges,
      priorLevel,
      newLevel,
      newTotalXp,
    })
  )

  return {
    stars,
    xpEarned,
    totalXp: newTotalXp,
    level: newLevel,
    streakDays: newStreak,
    newBadges,
  }
}
