"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { KittenCharacter } from "@/components/kitten/kitten-character"
import {
  hasModifiedClick,
  isInternalNavigation,
  LOADING_PHRASES,
  NAV_TIMEOUT_MS,
  type NavigationZone,
} from "@/lib/navigation"
import { cn } from "@workspace/ui/lib/utils"

const OVERLAY_STYLES: Record<NavigationZone, string> = {
  child:
    "bg-[#fbfaf6]/92 dark:bg-neutral-950/92 [background-image:radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(88,204,2,0.10),transparent),radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(255,150,0,0.08),transparent)]",
  parent:
    "bg-gradient-to-b from-game-cyan-soft/80 via-white/90 to-transparent dark:from-game-cyan-soft/40 dark:via-neutral-950/92 dark:to-transparent",
}

const LABEL_STYLES: Record<NavigationZone, string> = {
  child: "text-game-orange-edge",
  parent: "text-game-cyan-edge",
}

function KittyNavigationLoaderInner({ variant }: { variant: NavigationZone }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const [pending, setPending] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phrases = LOADING_PHRASES[variant]

  const routeKey = `${pathname}?${search}`

  useEffect(() => {
    setPending(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [routeKey])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (hasModifiedClick(event)) return

      const anchor = (event.target as HTMLElement).closest("a")
      if (!anchor) return

      const currentUrl = new URL(window.location.href)
      if (!isInternalNavigation(anchor, currentUrl)) return

      setPending(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setPending(false)
        timeoutRef.current = null
      }, NAV_TIMEOUT_MS)
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  useEffect(() => {
    if (!pending) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [pending])

  useEffect(() => {
    if (!pending) return
    const id = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [pending, phrases.length])

  return (
    <AnimatePresence>
      {pending ? (
        <motion.div
          key="nav-overlay"
          role="status"
          aria-live="polite"
          aria-label={phrases[phraseIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]",
            OVERLAY_STYLES[variant]
          )}
        >
          <KittenCharacter emotion="thinking" />
          <p className={cn("text-sm font-bold", LABEL_STYLES[variant])}>
            {phrases[phraseIndex]}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function KittyNavigationLoader({ variant }: { variant: NavigationZone }) {
  return <KittyNavigationLoaderInner variant={variant} />
}
