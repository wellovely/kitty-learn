"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, type PanInfo } from "framer-motion"
import { Lightbulb, SkipForward } from "lucide-react"
import { GameButton } from "@workspace/ui/components/game-button"
import { cn } from "@workspace/ui/lib/utils"
import { useSound } from "@/hooks/useSound"

type Pair = { left: string; right: string }

type Props = {
  pairs: Pair[]
  pending: boolean
  onComplete: () => void
  onHint: () => void
  onSkip: () => void
}

type RectLike = Pick<DOMRect, "bottom" | "height" | "left" | "right" | "top" | "width">

function shuffle<T>(items: T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

const TONES = [
  { edge: "border-game-cyan-edge", soft: "bg-game-cyan-soft", text: "text-game-cyan-edge" },
  { edge: "border-game-amber-edge", soft: "bg-game-amber-soft", text: "text-game-amber-edge" },
  { edge: "border-game-lime-edge", soft: "bg-game-lime-soft", text: "text-game-lime-edge" },
  { edge: "border-game-purple-edge", soft: "bg-game-purple-soft", text: "text-game-purple-edge" },
  { edge: "border-game-orange-edge", soft: "bg-game-orange-soft", text: "text-game-orange-edge" },
  { edge: "border-game-red-edge", soft: "bg-game-red-soft", text: "text-game-red-edge" },
]

function intersectionArea(a: RectLike, b: RectLike) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return width * height
}

export function findBestOverlappingSlot(
  cardRect: RectLike,
  slotRects: (RectLike | null)[],
  isAvailable: (index: number) => boolean = () => true
) {
  let bestIndex: number | null = null
  let bestArea = 0

  for (let i = 0; i < slotRects.length; i++) {
    if (!isAvailable(i)) continue
    const slotRect = slotRects[i]
    if (!slotRect) continue
    const area = intersectionArea(cardRect, slotRect)
    if (area > bestArea) {
      bestArea = area
      bestIndex = i
    }
  }

  return bestArea > 0 ? bestIndex : null
}

export function MatchPairsBoard({
  pairs,
  pending,
  onComplete,
  onHint,
  onSkip,
}: Props) {
  const { play } = useSound()
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const draggableRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [filled, setFilled] = useState<(string | null)[]>(() =>
    pairs.map(() => null)
  )
  const [wrongFlash, setWrongFlash] = useState<number | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)
  const completedRef = useRef(false)

  const shuffledRights = useMemo(
    () => shuffle(pairs.map((p) => p.right)),
    [pairs]
  )

  const remaining = shuffledRights.filter((r) => !filled.includes(r))

  useEffect(() => {
    if (completedRef.current) return
    if (filled.every((f) => f !== null) && filled.length > 0) {
      completedRef.current = true
      const t = setTimeout(() => onComplete(), 450)
      return () => clearTimeout(t)
    }
  }, [filled, onComplete])

  function findSlotAt(x: number, y: number, onlyAvailable = false): number | null {
    for (let i = 0; i < slotRefs.current.length; i++) {
      if (onlyAvailable && filled[i]) continue
      const el = slotRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i
    }
    return null
  }

  function findSlotForCard(right: string, point?: PanInfo["point"]) {
    const cardRect = draggableRefs.current[right]?.getBoundingClientRect()
    if (cardRect) {
      const slotRects = slotRefs.current.map((slot) => slot?.getBoundingClientRect() ?? null)
      const idx = findBestOverlappingSlot(cardRect, slotRects, (i) => !filled[i])
      if (idx !== null) return idx
    }
    return point ? findSlotAt(point.x, point.y, true) : null
  }

  function handleDrag(right: string) {
    if (pending || completedRef.current) return
    const nextSlot = findSlotForCard(right)
    setHoveredSlot((current) => (current === nextSlot ? current : nextSlot))
  }

  function handleDragEnd(right: string, info: PanInfo) {
    setHoveredSlot(null)
    if (pending || completedRef.current) return false
    const idx = findSlotForCard(right, info.point)
    if (idx === null) return false
    if (filled[idx]) return false
    if (pairs[idx]?.right === right) {
      play("correct")
      setFilled((prev) => {
        const next = prev.slice()
        next[idx] = right
        return next
      })
      return true
    }
    play("wrong")
    setWrongFlash(idx)
    setTimeout(() => setWrongFlash((cur) => (cur === idx ? null : cur)), 350)
    return false
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          {pairs.map((p, i) => {
            const tone = TONES[i % TONES.length]!
            const isFilled = filled[i] !== null
            const isWrong = wrongFlash === i
            const isHovered = hoveredSlot === i && !isFilled
            return (
              <div
                key={`slot-${i}`}
                ref={(el) => {
                  slotRefs.current[i] = el
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-[3px] p-2 transition-transform",
                  tone.edge,
                  tone.soft,
                  isFilled && "shadow-[0_4px_0_0_var(--game-lime-edge)]",
                  isHovered && "scale-[1.02] shadow-[0_0_0_4px_rgba(88,204,2,0.22)]",
                  isWrong && "animate-[wiggle_0.32s_ease-in-out]"
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-3xl dark:bg-neutral-900">
                  {p.left}
                </span>
                <div
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center rounded-xl border-[2px] border-dashed border-current px-2 text-base font-bold",
                    tone.text,
                    isFilled && "border-solid bg-white dark:bg-neutral-900"
                  )}
                >
                  {filled[i] ?? "…"}
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative min-h-[220px] rounded-2xl border-[3px] border-dashed border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Drag the words →
          </p>
          <div className="flex flex-wrap items-start justify-center gap-2">
            {shuffledRights.map((right, i) => {
              const isPlaced = filled.includes(right)
              if (isPlaced) return null
              const tone = TONES[i % TONES.length]!
              return (
                <motion.div
                  key={right}
                  ref={(el) => {
                    draggableRefs.current[right] = el
                  }}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.6}
                  dragMomentum={false}
                  whileDrag={{ scale: 1.08, zIndex: 50 }}
                  whileTap={{ scale: 1.04 }}
                  onDrag={() => handleDrag(right)}
                  onDragEnd={(_e, info) => handleDragEnd(right, info)}
                  className={cn(
                    "cursor-grab touch-none select-none rounded-2xl border-[3px] bg-white px-3 py-2 text-base font-bold shadow-[0_4px_0_0_var(--game-cyan-edge)] active:cursor-grabbing dark:bg-neutral-950",
                    tone.edge,
                    tone.text
                  )}
                >
                  {right}
                </motion.div>
              )
            })}
            {remaining.length === 0 && (
              <p className="py-6 text-center text-sm font-semibold text-game-lime-edge">
                Great job! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <GameButton
          type="button"
          color="amber"
          size="md"
          onClick={() => {
            play("pop")
            onHint()
          }}
          disabled={pending}
        >
          <Lightbulb />
          Hint
        </GameButton>
        <GameButton
          type="button"
          color="neutral"
          size="md"
          onClick={() => {
            play("pop")
            onSkip()
          }}
          disabled={pending}
        >
          <SkipForward />
          Skip
        </GameButton>
      </div>
    </div>
  )
}
