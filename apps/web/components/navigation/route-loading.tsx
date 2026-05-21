"use client"

import { useEffect, useState } from "react"
import { KittenCharacter } from "@/components/kitten/kitten-character"
import { LOADING_PHRASES, type NavigationZone } from "@/lib/navigation"
import { cn } from "@workspace/ui/lib/utils"

const VARIANT_STYLES: Record<
  NavigationZone,
  { label: string }
> = {
  child: { label: "text-game-orange-edge" },
  parent: { label: "text-game-cyan-edge" },
}

export function RouteLoading({ variant }: { variant: NavigationZone }) {
  const phrases = LOADING_PHRASES[variant]
  const [phraseIndex, setPhraseIndex] = useState(0)
  const styles = VARIANT_STYLES[variant]

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [phrases.length])

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16"
    >
      <KittenCharacter emotion="thinking" />
      <p className={cn("text-sm font-bold", styles.label)}>
        {phrases[phraseIndex]}
      </p>
    </div>
  )
}
