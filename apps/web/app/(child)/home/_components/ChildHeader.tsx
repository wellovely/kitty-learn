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
    <header className="sticky top-2 z-10 flex items-center gap-3 rounded-full border border-neutral-200/70 bg-white/85 px-2 py-1.5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-800/70 dark:bg-neutral-900/70">
      <Link
        href="/dashboard"
        aria-label="Back to parent"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <ArrowLeft />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">Hi, {name}</span>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
          <Stat icon={Star} value={xp} color="text-amber-500" label="xp" />
          <Stat icon={Flame} value={streak} color="text-rose-500" label="streak" />
          <Stat icon={Heart} value={hearts} color="text-emerald-500" label="hearts" />
        </div>
      </div>

      <SoundToggle />
    </header>
  )
}

function Stat({
  icon: Icon,
  value,
  color,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  color: string
  label: string
}) {
  return (
    <span className="flex items-center gap-1" aria-label={`${label} ${value}`}>
      <Icon className={`size-3.5 ${color}`} />
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
