import { describe, expect, it } from "vitest"
import { buildAchievementNotifications } from "@/lib/services/notifications"

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
