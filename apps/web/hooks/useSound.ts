"use client"

import { useCallback, useEffect, useState } from "react"
import { getSoundManager } from "@/lib/sound"

type SoundName =
  | "click"
  | "correct"
  | "wrong"
  | "complete"
  | "star"
  | "pop"
  | "unlock"

export function useSound() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(getSoundManager().isEnabled())
  }, [])

  const play = useCallback((name: SoundName) => {
    getSoundManager().play(name)
  }, [])

  const toggle = useCallback(() => {
    const v = getSoundManager().toggle()
    setEnabled(v)
    if (v) getSoundManager().play("pop")
  }, [])

  return { play, enabled, toggle }
}
