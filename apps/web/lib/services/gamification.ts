import type { Stars } from "./progress"

export type BadgeCode =
  | "first_lesson"
  | "streak_3"
  | "streak_7"
  | "perfect_stars"
  | "xp_100"
  | "xp_500"

export function computeEarnedBadges(args: {
  isFirstLessonEver: boolean
  stars: Stars
  streakDays: number
  totalXp: number
  alreadyEarned: Set<BadgeCode>
}): BadgeCode[] {
  const earned: BadgeCode[] = []
  const add = (code: BadgeCode) => {
    if (!args.alreadyEarned.has(code)) earned.push(code)
  }

  if (args.isFirstLessonEver) add("first_lesson")
  if (args.stars === 3) add("perfect_stars")
  if (args.streakDays >= 3) add("streak_3")
  if (args.streakDays >= 7) add("streak_7")
  if (args.totalXp >= 100) add("xp_100")
  if (args.totalXp >= 500) add("xp_500")

  return earned
}
