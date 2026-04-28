import { describe, expect, it } from "vitest"
import { updateStreak } from "@/lib/services/progress"

describe("updateStreak", () => {
  it("starts a streak on first activity", () => {
    expect(updateStreak(null, "2026-04-22", 0)).toBe(1)
  })
  it("keeps the streak if already active today", () => {
    expect(updateStreak("2026-04-22", "2026-04-22", 5)).toBe(5)
  })
  it("increments when active yesterday", () => {
    expect(updateStreak("2026-04-21", "2026-04-22", 5)).toBe(6)
  })
  it("resets after skipping a day", () => {
    expect(updateStreak("2026-04-20", "2026-04-22", 5)).toBe(1)
  })
})
