"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Mic, MicOff, Play, Square, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import type { ChatMessage, ChatReply, Emotion } from "@/lib/ai/schemas"
import { useVoiceTranscription } from "@/hooks/useVoiceTranscription"
import { useSpeech } from "@/hooks/useSpeech"
import { useSound } from "@/hooks/useSound"
import { SoundToggle } from "@/components/shared/SoundToggle"
import { KittenCharacter } from "@/app/(child)/lesson/[lessonId]/_components/KittenCharacter"

type Props = {
  childId: string
  childName: string
}

type Status = "idle" | "listening" | "transcribing" | "thinking" | "speaking"

export function KittenChat({ childId, childName }: Props) {
  const router = useRouter()
  const vt = useVoiceTranscription("en")
  const speech = useSpeech()
  const { play } = useSound()

  const [emotion, setEmotion] = useState<Emotion>("happy")
  const [status, setStatus] = useState<Status>("idle")
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [lastReply, setLastReply] = useState<string | null>(null)
  const [lastUser, setLastUser] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const greetedRef = useRef(false)

  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const hello = `Hi ${childName}! I'm Whiskers. What do you want to talk about today?`
    setLastReply(hello)
    setEmotion("excited")
    setStatus("speaking")
    speech.speak(hello, {
      onEnd: () => {
        setStatus("idle")
        setEmotion("happy")
      },
    })
  }, [childName, speech])

  useEffect(() => {
    if (vt.recording && status !== "listening") setStatus("listening")
    else if (vt.transcribing && status !== "transcribing") setStatus("transcribing")
  }, [vt.recording, vt.transcribing, status])

  async function send(message: string) {
    const text = message.trim()
    if (!text) {
      setStatus("idle")
      setEmotion("happy")
      return
    }
    setLastUser(text)
    setStatus("thinking")
    setEmotion("thinking")
    play("pop")

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          message: text,
          history: history.slice(-12),
        }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        console.error("chat failed", res.status, body)
        throw new Error("chat failed")
      }
      const data = (await res.json()) as ChatReply
      setHistory((h) => [
        ...h,
        { role: "user", content: text },
        { role: "assistant", content: data.reply },
      ])
      setLastReply(data.reply)
      setEmotion(data.emotion)
      setStatus("speaking")
      speech.speak(data.reply, {
        onEnd: () => {
          setStatus("idle")
          setEmotion("happy")
        },
      })
    } catch {
      toast.error("Whiskers got distracted — try again")
      setStatus("idle")
      setEmotion("confused")
    }
  }

  function handleMicTap() {
    if (status === "speaking") {
      speech.cancel()
      setStatus("idle")
      setEmotion("happy")
      return
    }
    if (status === "thinking" || status === "transcribing") return
    if (vt.recording) {
      vt.stop()
      return
    }
    play("click")
    setHasInteracted(true)
    setLastUser(null)
    setEmotion("thinking")
    setStatus("listening")
    void vt.start({
      onEnd: (text) => {
        if (text) {
          void send(text)
        } else {
          setStatus("idle")
          setEmotion("happy")
          toast("I didn't hear you 🐾", {
            description: "Tap the mic and say something out loud.",
          })
        }
      },
      onError: (code) => {
        setStatus("idle")
        setEmotion("confused")
        if (code === "not-allowed") {
          toast.error("Microphone is blocked", {
            description: "Click the lock icon in the address bar → Site settings → Microphone → Allow.",
          })
        } else if (code === "audio-capture") {
          toast.error("No microphone found", {
            description: "Plug in or enable a microphone and try again.",
          })
        } else if (code === "insecure-context") {
          toast.error("Voice needs HTTPS", {
            description: "Open the app on localhost or via https://",
          })
        } else if (code === "not-supported") {
          toast.error("Voice not supported here", {
            description: "Your browser can't record audio.",
          })
        } else if (code === "transcribe-failed") {
          toast.error("Transcription failed", {
            description: "Check the DEEPGRAM_API_KEY on the server.",
          })
        } else if (code === "network") {
          toast.error("Network error — check your connection")
        } else {
          toast.error(`Voice error: ${code}`)
        }
      },
    })
  }

  function exit() {
    speech.cancel()
    vt.stop()
    router.push(`/home?childId=${childId}`)
  }

  if (!vt.supported) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <KittenCharacter emotion="confused" />
        <p className="text-base font-semibold">
          This browser can&apos;t hear me yet 😿
        </p>
        <p className="text-muted-foreground max-w-xs text-sm">
          Voice chat needs microphone access. Try Chrome, Edge, Safari, or
          Arc on a device with a microphone.
        </p>
        <Button onClick={exit} className="rounded-full">
          Back home
        </Button>
      </div>
    )
  }

  const showPlayIcon = status === "idle" && !hasInteracted

  const micLabel = (() => {
    switch (status) {
      case "listening":
        return "Listening…"
      case "transcribing":
        return "Transcribing…"
      case "thinking":
        return "Thinking…"
      case "speaking":
        return "Tap to stop"
      default:
        return showPlayIcon ? "Tap to start" : "Tap to talk"
    }
  })()

  const micDisabled = status === "thinking" || status === "transcribing"

  return (
    <div className="flex min-h-[calc(100svh-2rem)] flex-col gap-4">
      <header className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-neutral-900/70">
        <button
          type="button"
          onClick={exit}
          className="text-muted-foreground inline-flex items-center gap-1 text-sm"
        >
          <X className="size-4" /> End
        </button>
        <h1 className="text-base font-bold">Talk to Whiskers</h1>
        <SoundToggle />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        <div className="scale-125 sm:scale-150">
          <KittenCharacter
            emotion={emotion}
            speaking={status === "speaking"}
          />
        </div>

        <div className="min-h-[64px] w-full max-w-sm">
          <AnimatePresence mode="wait">
            {lastReply && (
              <motion.div
                key={lastReply}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="relative rounded-2xl bg-white px-4 py-3 text-center text-base font-medium text-neutral-700 shadow-md ring-1 ring-amber-100 dark:bg-neutral-900 dark:text-neutral-100 dark:ring-amber-900/40"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-amber-100 dark:bg-neutral-900 dark:ring-amber-900/40"
                />
                {lastReply}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {lastUser && (
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
            You said: &ldquo;{lastUser}&rdquo;
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 pb-6">
        <div className="relative">
          {status === "listening" && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-400/40"
                animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-rose-400/30"
                animate={{ scale: [1, 2.0, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
          <button
            type="button"
            onClick={handleMicTap}
            disabled={micDisabled}
            aria-label={micLabel}
            className={
              "relative flex size-24 items-center justify-center rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60 " +
              (status === "listening"
                ? "bg-rose-600"
                : status === "speaking"
                  ? "bg-amber-500"
                  : status === "transcribing"
                    ? "bg-amber-400"
                    : status === "thinking"
                      ? "bg-neutral-400"
                      : "bg-rose-500 hover:bg-rose-600")
            }
          >
            {status === "listening" ? (
              <Square className="size-9" />
            ) : status === "transcribing" ? (
              <Loader2 className="size-9 animate-spin" />
            ) : status === "thinking" ? (
              <MicOff className="size-9" />
            ) : showPlayIcon ? (
              <Play className="size-10 fill-white" />
            ) : (
              <Mic className="size-10" />
            )}
          </button>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300">
          {micLabel}
        </p>
        <p className="text-muted-foreground text-center text-xs">
          Free chat — say anything to Whiskers!
        </p>
      </div>
    </div>
  )
}
