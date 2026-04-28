"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getSoundManager } from "@/lib/sound"

type SpeakOptions = {
  voice?: string
  interrupt?: boolean
  onEnd?: () => void
}

export function useSpeech() {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setSupported(typeof window !== "undefined" && typeof Audio !== "undefined")
  }, [])

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.onplaying = null
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    cleanup()
    setSpeaking(false)
  }, [cleanup])

  const speak = useCallback(
    async (text: string, opts: SpeakOptions = {}) => {
      if (typeof window === "undefined") return
      if (!getSoundManager().isEnabled()) return
      const trimmed = text?.trim()
      if (!trimmed) return

      if (opts.interrupt !== false) cancel()

      const ctrl = new AbortController()
      abortRef.current = ctrl

      try {
        const res = await fetch("/api/ai/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, voice: opts.voice }),
          signal: ctrl.signal,
        })
        if (!res.ok) {
          console.error("speak request failed", res.status)
          return
        }
        const blob = await res.blob()
        if (ctrl.signal.aborted) return

        const url = URL.createObjectURL(blob)
        urlRef.current = url
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onplaying = () => setSpeaking(true)
        audio.onended = () => {
          setSpeaking(false)
          cleanup()
          opts.onEnd?.()
        }
        audio.onerror = () => {
          setSpeaking(false)
          cleanup()
        }
        await audio.play()
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        console.error("speak error", err)
        setSpeaking(false)
      }
    },
    [cancel, cleanup]
  )

  useEffect(() => {
    const unsub = getSoundManager().subscribe((enabled) => {
      if (!enabled) cancel()
    })
    return () => {
      unsub()
      cancel()
    }
  }, [cancel])

  return { supported, speak, cancel, speaking }
}
