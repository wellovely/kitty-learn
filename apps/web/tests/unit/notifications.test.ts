import { describe, expect, it } from "vitest"
import {
  buildAchievementNotifications,
  buildLessonCompletedNotification,
  buildStreakActivityNotification,
} from "@/lib/services/notifications"

const base = {
  parentId: "00000000-0000-0000-0000-000000000001",
  childId: "00000000-0000-0000-0000-000000000002",
  childName: "Mira",
  newTotalXp: 250,
}

describe("buildAchievementNotifications", () => {
  it("returns nothing when no badges and no level-up", () => {
    expect(
      buildAchievementNotifications({
        ...base,
        newBadges: [],
        priorLevel: 3,
        newLevel: 3,
      })
    ).toEqual([])
  })

  it("emits one notification per new badge with dedupe key", () => {
    const out = buildAchievementNotifications({
      ...base,
      newBadges: [
        { code: "first_lesson", title: "First Steps", icon: "🐾" },
        { code: "streak_3", title: "3-Day Streak", icon: "🔥" },
      ],
      priorLevel: 1,
      newLevel: 1,
    })
    expect(out).toHaveLength(2)
    expect(out[0]!.type).toBe("achievement")
    expect(out[0]!.payload?.dedupe_key).toBe("badge:first_lesson")
    expect(out[1]!.payload?.dedupe_key).toBe("badge:streak_3")
  })

  it("emits a level-up notification when level increases", () => {
    const out = buildAchievementNotifications({
      ...base,
      newBadges: [],
      priorLevel: 2,
      newLevel: 3,
    })
    expect(out).toHaveLength(1)
    expect(out[0]!.title).toContain("level 3")
    expect(out[0]!.payload?.dedupe_key).toBe("level:3")
  })

  it("does not emit level-up when level is unchanged or lower", () => {
    expect(
      buildAchievementNotifications({
        ...base,
        newBadges: [],
        priorLevel: 5,
        newLevel: 5,
      })
    ).toEqual([])
    expect(
      buildAchievementNotifications({
        ...base,
        newBadges: [],
        priorLevel: 5,
        newLevel: 4,
      })
    ).toEqual([])
  })

  it("combines badges and level-up in one batch", () => {
    const out = buildAchievementNotifications({
      ...base,
      newBadges: [{ code: "xp_100", title: "XP Explorer", icon: "🎒" }],
      priorLevel: 1,
      newLevel: 2,
    })
    expect(out).toHaveLength(2)
    expect(out.map((n) => n.payload?.dedupe_key)).toEqual([
      "badge:xp_100",
      "level:2",
    ])
  })
})

describe("buildLessonCompletedNotification", () => {
  it("emits lesson_completed with lesson dedupe key", () => {
    const out = buildLessonCompletedNotification({
      parentId: base.parentId,
      childId: base.childId,
      childName: base.childName,
      lessonId: "00000000-0000-0000-0000-000000000099",
      lessonTitle: "Counting to 5",
      stars: 3,
      xpEarned: 35,
    })
    expect(out).not.toBeNull()
    expect(out!.type).toBe("lesson_completed")
    expect(out!.title).toContain("completed a lesson")
    expect(out!.body).toContain("Counting to 5")
    expect(out!.payload?.dedupe_key).toBe(
      "lesson:00000000-0000-0000-0000-000000000099"
    )
  })
})

describe("buildStreakActivityNotification", () => {
  it("emits started streak copy for day 1", () => {
    const out = buildStreakActivityNotification({
      parentId: base.parentId,
      childId: base.childId,
      childName: base.childName,
      streakDays: 1,
      today: "2026-05-21",
    })
    expect(out!.type).toBe("streak")
    expect(out!.title).toContain("started a streak")
    expect(out!.payload?.dedupe_key).toBe("streak_day:2026-05-21")
  })

  it("emits continued streak copy for multi-day streak", () => {
    const out = buildStreakActivityNotification({
      parentId: base.parentId,
      childId: base.childId,
      childName: base.childName,
      streakDays: 5,
      today: "2026-05-21",
    })
    expect(out!.title).toContain("5-day streak")
    expect(out!.body).toContain("Streak saved")
  })
})
