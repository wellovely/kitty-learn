"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Check, Lock, Play, Star } from "lucide-react"
import { useSound } from "@/hooks/useSound"
import { cn } from "@workspace/ui/lib/utils"

export type RoadmapLesson = {
  id: string
  title: string
  unitTitle: string
  unitOrder: number
  stars: number
  locked: boolean
}

// Tight zig-zag so the 88px button + caption never touches the edge of max-w-md.
const OFFSETS_PX = [0, 28, 40, 28, 0, -28, -40, -28] as const

const UNIT_PALETTES = [
  { main: "#58cc02", edge: "#3ea102", soft: "#eaffd4" },
  { main: "#ff9600", edge: "#cf7400", soft: "#ffeccc" },
  { main: "#1cb0f6", edge: "#0a85c4", soft: "#d6efff" },
  { main: "#ce82ff", edge: "#9352cb", soft: "#f1e1ff" },
  { main: "#ff4b4b", edge: "#c93232", soft: "#ffdede" },
] as const

type Palette = (typeof UNIT_PALETTES)[number]

export function Roadmap({
  lessons,
  childId,
}: {
  lessons: RoadmapLesson[]
  childId: string
}) {
  let currentMarked = false

  return (
    <div className="relative flex flex-col items-center gap-2 pt-6 pb-20">
      {lessons.map((l, i) => {
        const prev = lessons[i - 1]
        const unitChanged = !prev || prev.unitOrder !== l.unitOrder
        const palette = UNIT_PALETTES[l.unitOrder % UNIT_PALETTES.length]!
        const completed = l.stars >= 1
        const isCurrent = !completed && !l.locked && !currentMarked
        if (isCurrent) currentMarked = true

        const offset = OFFSETS_PX[i % OFFSETS_PX.length]!

        return (
          <div
            key={l.id}
            className="relative flex w-full flex-col items-center"
          >
            {unitChanged ? (
              <UnitBanner
                title={`Unit ${l.unitOrder}`}
                subtitle={l.unitTitle}
                palette={palette}
              />
            ) : (
              <PathDots />
            )}

            <div
              className="relative flex flex-col items-center"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {isCurrent && <StartHereCallout />}
              <LessonNode
                index={i + 1}
                title={l.title}
                locked={l.locked}
                isCurrent={isCurrent}
                completed={completed}
                palette={palette}
                childId={childId}
                lessonId={l.id}
              />
              <Caption
                title={l.title}
                stars={l.stars}
                completed={completed}
                locked={l.locked}
              />
            </div>
          </div>
        )
      })}

      <p className="pt-8 text-center text-[11px] font-medium tracking-wide text-neutral-400">
        Finish a lesson to unlock the next one
      </p>
    </div>
  )
}

// ─────────────────────────────── UNIT BANNER

function UnitBanner({
  title,
  subtitle,
  palette,
}: {
  title: string
  subtitle: string
  palette: Palette
}) {
  return (
    <div
      className="my-6 flex w-full items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white/80 px-3.5 py-3 backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/60"
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: palette.main }}
      >
        <BookOpen className="size-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{ color: palette.edge }}
        >
          {title}
        </p>
        <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────── PATH DOTS

function PathDots() {
  return (
    <div
      aria-hidden
      className="flex flex-col items-center gap-1 py-2"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-neutral-300/80 dark:bg-neutral-700/80"
        />
      ))}
    </div>
  )
}

// ─────────────────────────────── LESSON NODE (the 3D button)

function LessonNode(props: {
  index: number
  title: string
  locked: boolean
  isCurrent: boolean
  completed: boolean
  palette: Palette
  childId: string
  lessonId: string
}) {
  const { play } = useSound()
  const size = "size-[84px]"

  if (props.locked) {
    return (
      <button
        type="button"
        disabled
        aria-label={`Lesson ${props.index} locked`}
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-neutral-200/80 text-neutral-400 dark:bg-neutral-800/70 dark:text-neutral-500",
          size
        )}
      >
        <Lock className="size-7" strokeWidth={2.5} />
      </button>
    )
  }

  const bodyStyle: React.CSSProperties = {
    background: props.palette.main,
    boxShadow: `0 6px 0 0 ${props.palette.edge}`,
    color: "#ffffff",
    borderColor: props.palette.edge,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileTap={{ y: 4 }}
      className="relative"
    >
      <Link
        href={`/lesson/${props.lessonId}?childId=${props.childId}`}
        onClick={() => play("click")}
        onPointerEnter={() => props.isCurrent && play("pop")}
        aria-label={`Lesson ${props.index}: ${props.title}`}
        className={cn(
          "relative flex items-center justify-center rounded-full border-[3px] transition-all",
          size,
          "active:translate-y-1 active:shadow-[0_2px_0_0]",
          props.isCurrent && "animate-[wiggle_1.2s_ease-in-out_infinite]"
        )}
        style={bodyStyle}
      >
        {props.completed ? (
          <Check className="size-9" strokeWidth={4} />
        ) : (
          <Play
            className="size-9 translate-x-0.5 fill-current"
            strokeWidth={0}
          />
        )}
        {!props.completed && (
          <span className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-neutral-800 shadow-sm ring-1 ring-neutral-200">
            {props.index}
          </span>
        )}
      </Link>
    </motion.div>
  )
}

// ─────────────────────────────── CAPTION UNDER NODE

function Caption({
  title,
  stars,
  completed,
  locked,
}: {
  title: string
  stars: number
  completed: boolean
  locked: boolean
}) {
  return (
    <div className="mt-2.5 flex flex-col items-center gap-1">
      <span
        className={cn(
          "max-w-[11rem] truncate text-[11px] font-semibold tracking-wide",
          locked
            ? "text-neutral-400"
            : "text-neutral-600 dark:text-neutral-300"
        )}
      >
        {title}
      </span>
      {completed && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              strokeWidth={0}
              className={cn(
                "size-3",
                n <= stars ? "fill-amber-400" : "fill-neutral-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────── CALLOUT

function StartHereCallout() {
  return (
    <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm dark:bg-white dark:text-neutral-900">
      Start
    </div>
  )
}
