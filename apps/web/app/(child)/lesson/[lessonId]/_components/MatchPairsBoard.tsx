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

function hashString(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) {
    h = (Math.imul(31, h) + value.charCodeAt(i)) | 0
  }
  return h >>> 0
}

/** Same input → same order on server and client (avoids hydration mismatch). */
function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = items.slice()
  let state = hashString(seed) || 1
  const rand = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 0xffffffff
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

const DROP_HIT_PADDING = 12

function pointerClientXY(
  event: MouseEvent | TouchEvent | PointerEvent,
  draggedEl: HTMLElement | null
): { x: number; y: number } {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    const t = event.changedTouches[0]!
    return { x: t.clientX, y: t.clientY }
  }
  if ("clientX" in event && Number.isFinite(event.clientX)) {
    return { x: event.clientX, y: event.clientY }
  }
  if (draggedEl) {
    const r = draggedEl.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return { x: 0, y: 0 }
}

function findSlotIndex(
  slots: (HTMLDivElement | null)[],
  x: number,
  y: number
): number | null {
  const pad = DROP_HIT_PADDING
  for (let i = 0; i < slots.length; i++) {
    const el = slots[i]
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (
      x >= r.left - pad &&
      x <= r.right + pad &&
      y >= r.top - pad &&
      y <= r.bottom + pad
    ) {
      return i
    }
  }
  return null
}

const TONES = [
  { edge: "border-game-cyan-edge", soft: "bg-game-cyan-soft", text: "text-game-cyan-edge" },
  { edge: "border-game-amber-edge", soft: "bg-game-amber-soft", text: "text-game-amber-edge" },
  { edge: "border-game-lime-edge", soft: "bg-game-lime-soft", text: "text-game-lime-edge" },
  { edge: "border-game-purple-edge", soft: "bg-game-purple-soft", text: "text-game-purple-edge" },
  { edge: "border-game-orange-edge", soft: "bg-game-orange-soft", text: "text-game-orange-edge" },
  { edge: "border-game-red-edge", soft: "bg-game-red-soft", text: "text-game-red-edge" },
]

export function MatchPairsBoard({
  pairs,
  pending,
  onComplete,
  onHint,
  onSkip,
}: Props) {
  const { play } = useSound()
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const dragRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [filled, setFilled] = useState<(string | null)[]>(() =>
    pairs.map(() => null)
  )
  const [wrongFlash, setWrongFlash] = useState<number | null>(null)
  const completedRef = useRef(false)

  const shuffledRights = useMemo(() => {
    const rights = pairs.map((p) => p.right)
    const seed = pairs.map((p) => `${p.left}\0${p.right}`).join("\x1e")
    return seededShuffle(rights, seed)
  }, [pairs])

  const remaining = shuffledRights.filter((r) => !filled.includes(r))

  useEffect(() => {
    if (completedRef.current) return
    if (filled.every((f) => f !== null) && filled.length > 0) {
      completedRef.current = true
      const t = setTimeout(() => onComplete(), 450)
      return () => clearTimeout(t)
    }
  }, [filled, onComplete])

  function handleDragEnd(
    right: string,
    event: MouseEvent | TouchEvent | PointerEvent,
    _info: PanInfo
  ) {
    if (pending || completedRef.current) return false
    const { x, y } = pointerClientXY(event, dragRefs.current[right] ?? null)
    const idx = findSlotIndex(slotRefs.current, x, y)
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
            return (
              <div
                key={`slot-${i}`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-[3px] p-2 transition-transform",
                  tone.edge,
                  tone.soft,
                  isFilled && "shadow-[0_4px_0_0_var(--game-lime-edge)]",
                  isWrong && "animate-[wiggle_0.32s_ease-in-out]"
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-3xl dark:bg-neutral-900">
                  {p.left}
                </span>
                <div
                  ref={(el) => {
                    slotRefs.current[i] = el
                  }}
                  className={cn(
                    "flex h-12 min-h-12 flex-1 items-center justify-center rounded-xl border-[2px] border-dashed border-current px-2 text-base font-bold",
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
                    dragRefs.current[right] = el
                  }}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.2}
                  dragMomentum={false}
                  whileDrag={{ scale: 1.08, zIndex: 50 }}
                  whileTap={{ scale: 1.04 }}
                  onDragEnd={(e, info) => handleDragEnd(right, e, info)}
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
