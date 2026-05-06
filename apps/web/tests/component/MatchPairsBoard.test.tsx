import { describe, expect, it } from "vitest"
import { findBestOverlappingSlot } from "@/app/(child)/lesson/[lessonId]/_components/MatchPairsBoard"

const rect = (
  left: number,
  top: number,
  right: number,
  bottom: number
) => ({
  left,
  top,
  right,
  bottom,
  width: right - left,
  height: bottom - top,
})

describe("findBestOverlappingSlot", () => {
  it("selects the slot with the largest overlap with the dragged card", () => {
    const draggedCard = rect(75, 0, 175, 80)

    expect(
      findBestOverlappingSlot(draggedCard, [
        rect(0, 0, 100, 100),
        rect(100, 0, 200, 100),
      ])
    ).toBe(1)
  })

  it("skips unavailable slots when choosing a drop target", () => {
    const draggedCard = rect(0, 0, 100, 100)

    expect(
      findBestOverlappingSlot(
        draggedCard,
        [rect(0, 0, 100, 100), rect(60, 0, 160, 100)],
        (index) => index !== 0
      )
    ).toBe(1)
  })

  it("does not choose a slot when the dragged card does not overlap any target", () => {
    expect(
      findBestOverlappingSlot(rect(250, 250, 300, 300), [
        rect(0, 0, 100, 100),
        rect(100, 0, 200, 100),
      ])
    ).toBeNull()
  })
})
