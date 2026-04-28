import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { KittenCharacter } from "@/app/(child)/lesson/[lessonId]/_components/KittenCharacter"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}))

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
}))

describe("KittenCharacter", () => {
  it("shows the correct emotion image", () => {
    render(<KittenCharacter emotion="happy" />)
    const img = screen.getByAltText(/kitten happy/i) as HTMLImageElement
    expect(img.src).toContain("kitten-happy")
  })

  it("switches images when emotion changes", () => {
    const { rerender } = render(<KittenCharacter emotion="idle" />)
    expect(screen.getByAltText(/kitten idle/i)).toBeInTheDocument()
    rerender(<KittenCharacter emotion="excited" />)
    expect(screen.getByAltText(/kitten excited/i)).toBeInTheDocument()
  })
})
