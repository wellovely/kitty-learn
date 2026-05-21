import { describe, expect, it } from "vitest"
import { hasModifiedClick, isInternalNavigation } from "@/lib/navigation"

function anchor(href: string, base = "http://localhost:3000") {
  const el = document.createElement("a")
  el.href = new URL(href, base).href
  return el
}

function current(path = "/home?childId=abc") {
  return new URL(path, "http://localhost:3000")
}

describe("isInternalNavigation", () => {
  it("returns true for same-origin path change", () => {
    expect(
      isInternalNavigation(anchor("/lesson/1?childId=abc"), current())
    ).toBe(true)
  })

  it("returns true when only search params change", () => {
    expect(
      isInternalNavigation(
        anchor("/home?childId=other"),
        current("/home?childId=abc")
      )
    ).toBe(true)
  })

  it("returns false for same pathname and search", () => {
    expect(
      isInternalNavigation(
        anchor("/home?childId=abc"),
        current("/home?childId=abc")
      )
    ).toBe(false)
  })

  it("returns false for hash-only change", () => {
    expect(
      isInternalNavigation(
        anchor("/home?childId=abc#section"),
        current("/home?childId=abc")
      )
    ).toBe(false)
  })

  it("returns false for external origin", () => {
    const el = document.createElement("a")
    el.href = "https://example.com/page"
    expect(isInternalNavigation(el, current())).toBe(false)
  })

  it("returns false for _blank target", () => {
    const el = anchor("/dashboard")
    el.target = "_blank"
    expect(isInternalNavigation(el, current())).toBe(false)
  })

  it("returns false for download links", () => {
    const el = anchor("/file.pdf")
    el.setAttribute("download", "")
    expect(isInternalNavigation(el, current())).toBe(false)
  })

  it("returns false for hash-only href", () => {
    const el = document.createElement("a")
    el.href = "http://localhost:3000/home?childId=abc#top"
    el.setAttribute("href", "#top")
    expect(isInternalNavigation(el, current())).toBe(false)
  })

  it("returns false for mailto and tel", () => {
    expect(isInternalNavigation(anchor("mailto:a@b.com"), current())).toBe(false)
    expect(isInternalNavigation(anchor("tel:+123"), current())).toBe(false)
  })
})

describe("hasModifiedClick", () => {
  it("detects modifier keys and non-primary button", () => {
    expect(hasModifiedClick({ metaKey: true } as MouseEvent)).toBe(true)
    expect(hasModifiedClick({ ctrlKey: true } as MouseEvent)).toBe(true)
    expect(hasModifiedClick({ shiftKey: true } as MouseEvent)).toBe(true)
    expect(hasModifiedClick({ altKey: true } as MouseEvent)).toBe(true)
    expect(hasModifiedClick({ button: 1 } as MouseEvent)).toBe(true)
    expect(hasModifiedClick({ button: 0 } as MouseEvent)).toBe(false)
  })
})
