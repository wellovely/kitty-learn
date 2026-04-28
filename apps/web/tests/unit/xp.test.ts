import { describe, expect, it } from "vitest"
import {
  calculateStars,
  calculateXp,
  xpToLevel,
} from "@/lib/services/progress"

describe("calculateStars", () => {
  it("gives 0 when nothing correct", () => {
    expect(calculateStars(0, 3)).toBe(0)
  })
  it("gives 1 at 50%", () => {
    expect(calculateStars(1, 2)).toBe(1)
  })
  it("gives 2 at 75%", () => {
    expect(calculateStars(3, 4)).toBe(2)
  })
  it("gives 3 at 95%+", () => {
    expect(calculateStars(10, 10)).toBe(3)
  })
  it("handles zero total safely", () => {
    expect(calculateStars(0, 0)).toBe(0)
  })
})

describe("calculateXp", () => {
  it("zero stars means zero base", () => {
    expect(calculateXp(0, false)).toBe(0)
    expect(calculateXp(0, true)).toBe(5)
  })
  it("adds first-time bonus", () => {
    expect(calculateXp(3, true)).toBe(35)
    expect(calculateXp(3, false)).toBe(30)
  })
})

describe("xpToLevel", () => {
  it("starts at 1", () => {
    expect(xpToLevel(0)).toBe(1)
    expect(xpToLevel(99)).toBe(1)
  })
  it("advances every 100 xp", () => {
    expect(xpToLevel(100)).toBe(2)
    expect(xpToLevel(550)).toBe(6)
  })
})
