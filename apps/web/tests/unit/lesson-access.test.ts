import { describe, expect, it } from "vitest"
import { isLessonUnlocked } from "@/lib/services/lesson-access"

const flat = ["L1", "L2", "L3", "L4"] as const

describe("isLessonUnlocked", () => {
  it("returns 'ok' for the very first lesson with no progress", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "L1",
        starsByLesson: new Map(),
      })
    ).toBe("ok")
  })

  it("returns 'locked' when the previous lesson has 0 stars", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "L2",
        starsByLesson: new Map(),
      })
    ).toBe("locked")
  })

  it("returns 'locked' when an earlier (non-immediate) prereq has 0 stars", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "L4",
        starsByLesson: new Map([
          ["L1", 3],
          ["L3", 3],
        ]),
      })
    ).toBe("locked")
  })

  it("returns 'ok' when every prereq has at least 1 star", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "L3",
        starsByLesson: new Map([
          ["L1", 1],
          ["L2", 1],
        ]),
      })
    ).toBe("ok")
  })

  it("returns 'ok' for a replay of a completed lesson", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "L2",
        starsByLesson: new Map([
          ["L1", 3],
          ["L2", 2],
        ]),
      })
    ).toBe("ok")
  })

  it("returns 'not_found' when the lesson is not in the curriculum", () => {
    expect(
      isLessonUnlocked({
        flatLessonIds: flat,
        targetId: "GHOST",
        starsByLesson: new Map(),
      })
    ).toBe("not_found")
  })
})
