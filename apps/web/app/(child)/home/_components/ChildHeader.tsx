"use client"

import Link from "next/link"
import { ArrowLeft, Flame, Heart, Star } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { SoundToggle } from "@/components/shared/SoundToggle"

export function ChildHeader({
  name,
  xp,
  streak,
  hearts,
}: {
  name: string
  xp: number
  streak: number
  hearts: number
}) {
  return (
    <header className="sticky top-2 z-10 flex items-center gap-3 rounded-full border-[2px] border-game-cyan-edge bg-white px-2 py-1.5 shadow-[0_4px_0_0_var(--game-cyan-edge)] dark:bg-neutral-900">
      <Link
        href="/dashboard"
        aria-label="Back to parent"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <ArrowLeft />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1 leading-tight">
        <span className="truncate text-sm font-bold">Hi, {name}</span>
        <div className="flex items-center gap-1.5">
          <Chip icon={Star} value={xp} tone="amber" label="xp" />
          <Chip icon={Flame} value={streak} tone="red" label="streak" />
          <Chip icon={Heart} value={hearts} tone="lime" label="hearts" />
        </div>
      </div>

      <SoundToggle />
    </header>
  )
}

const CHIP_TONES = {
  amber:
    "border-game-amber-edge bg-game-amber-soft text-game-amber-edge",
  red: "border-game-red-edge bg-game-red-soft text-game-red-edge",
  lime: "border-game-lime-edge bg-game-lime-soft text-game-lime-edge",
} as const

function Chip({
  icon: Icon,
  value,
  tone,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  tone: keyof typeof CHIP_TONES
  label: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-[2px] px-2 py-0.5 text-[11px] font-bold ${CHIP_TONES[tone]}`}
      aria-label={`${label} ${value}`}
    >
      <Icon className="size-3" />
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
