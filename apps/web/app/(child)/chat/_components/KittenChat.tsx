"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2, Mic, MicOff, Play, Sparkles, Square, X } from "lucide-react"
import { toast } from "sonner"
import { GameButton } from "@workspace/ui/components/game-button"
import type { ChatMessage, Emotion } from "@/lib/ai/schemas"
import { pickEmotion } from "@/lib/ai/emotion"
import { QUIZ_SENTINEL, QuizSchema, type Quiz } from "@/lib/ai/quiz"
import { useVoiceTranscription } from "@/hooks/useVoiceTranscription"
import { useSpeech } from "@/hooks/useSpeech"
import { useSound } from "@/hooks/useSound"
import { SoundToggle } from "@/components/shared/SoundToggle"
import { KittenCharacter } from "@/components/kitten/kitten-character"

type Props = {
  childId: string
  childName: string
}

type Status = "idle" | "listening" | "transcribing" | "thinking" | "streaming" | "speaking"

export function KittenChat({ childId, childName }: Props) {
  const router = useRouter()
  const vt = useVoiceTranscription("en")
  const speech = useSpeech()
  const { play } = useSound()

  const [emotion, setEmotion] = useState<Emotion>("happy")
  const [status, setStatus] = useState<Status>("idle")
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [pendingUser, setPendingUser] = useState<string | null>(null)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<{
    index: number
    correct: boolean
  } | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const greetedRef = useRef(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const hello = `Hi ${childName}! I'm Whiskers. I love chatting about pretty much anything — animals, space, your favorite snack, a silly story you made up. What's on your mind today?`
    setHistory([{ role: "assistant", content: hello }])
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
    const el = transcriptRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [history, pendingUser, streamingReply, status])

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
    setPendingUser(text)
    setStreamingReply(null)
    setStatus("thinking")
    setEmotion("thinking")
    play("pop")

    const historyForApi = [...history, { role: "user" as const, content: text }].slice(-20)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          message: text,
          history: history.slice(-20),
        }),
      })
      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => "")
        console.error("chat failed", res.status, body)
        throw new Error("chat failed")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      let started = false
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        acc += chunk
        if (!started) {
          started = true
          setStatus("streaming")
          setEmotion("happy")
        }
        const sentinelAt = acc.indexOf(QUIZ_SENTINEL)
        const visible = sentinelAt >= 0 ? acc.slice(0, sentinelAt) : acc
        setStreamingReply(visible)
      }
      acc += decoder.decode()

      const sentinelAt = acc.indexOf(QUIZ_SENTINEL)
      const replyText = (sentinelAt >= 0 ? acc.slice(0, sentinelAt) : acc).trim()
      if (!replyText) throw new Error("empty reply")

      let quiz: Quiz | null = null
      if (sentinelAt >= 0) {
        const tail = acc.slice(sentinelAt + QUIZ_SENTINEL.length).trim()
        try {
          const parsed = QuizSchema.safeParse(JSON.parse(tail))
          if (parsed.success) quiz = parsed.data
        } catch {
          /* ignore malformed quiz */
        }
      }

      const replyEmotion = pickEmotion(replyText)
      setHistory([
        ...historyForApi,
        { role: "assistant", content: replyText },
      ])
      setStreamingReply(null)
      setPendingUser(null)
      setEmotion(replyEmotion)
      setStatus("speaking")
      speech.speak(replyText, {
        onEnd: () => {
          if (quiz) {
            setCurrentQuiz(quiz)
            setQuizAnswer(null)
            setEmotion("excited")
            setStatus("idle")
          } else {
            setStatus("idle")
            setEmotion("happy")
          }
        },
      })
    } catch {
      setPendingUser(null)
      setStreamingReply(null)
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
    setPendingUser(null)
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
    setCurrentQuiz(null)
    setQuizAnswer(null)
    router.push(`/home?childId=${childId}`)
  }

  function answerQuiz(index: number) {
    if (!currentQuiz || quizAnswer) return
    const correct = index === currentQuiz.correctIndex
    setQuizAnswer({ index, correct })
    play(correct ? "correct" : "wrong")
    const correctLabel = currentQuiz.options[currentQuiz.correctIndex]
    const fb = correct
      ? currentQuiz.feedback?.correct ?? "Yes! That's right!"
      : currentQuiz.feedback?.wrong ?? `Almost! The answer is "${correctLabel}".`
    setEmotion(correct ? "excited" : "sad")
    setHistory((h) => [...h, { role: "assistant", content: fb }])
    setStatus("speaking")
    speech.speak(fb, {
      onEnd: () => {
        setCurrentQuiz(null)
        setQuizAnswer(null)
        setStatus("idle")
        setEmotion("happy")
      },
    })
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
        <GameButton color="orange" onClick={exit}>
          Back home
        </GameButton>
      </div>
    )
  }

  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant")?.content
  const speakingBubble = status === "speaking" ? lastAssistant : null

  const showPlayIcon = status === "idle" && !hasInteracted

  const micLabel = (() => {
    switch (status) {
      case "listening":
        return "Listening…"
      case "transcribing":
        return "Transcribing…"
      case "thinking":
        return "Thinking…"
      case "streaming":
        return "Whiskers is replying…"
      case "speaking":
        return "Tap to stop"
      default:
        return showPlayIcon ? "Tap to start" : "Tap to talk"
    }
  })()

  const micDisabled =
    status === "thinking" ||
    status === "transcribing" ||
    status === "streaming" ||
    currentQuiz !== null

  const micColor: "red" | "orange" | "amber" | "cyan" | "neutral" =
    status === "listening"
      ? "red"
      : status === "speaking"
        ? "orange"
        : status === "transcribing"
          ? "amber"
          : status === "thinking" || status === "streaming"
            ? "neutral"
            : "red"

  return (
    <div className="relative flex h-[calc(100svh-5rem)] min-h-0 flex-col gap-3">
      <header className="flex items-center justify-between rounded-2xl border-2 border-game-orange-edge/20 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-md dark:border-game-orange-edge/30 dark:bg-neutral-900/80">
        <button
          type="button"
          onClick={exit}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="size-4" /> End
        </button>
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-game-lime" />
          <h1 className="text-sm font-extrabold tracking-tight">Talk to Whiskers</h1>
        </div>
        <SoundToggle />
      </header>

      <section className="relative overflow-hidden rounded-3xl border-2 border-game-orange-edge/20 bg-gradient-to-b from-game-orange-soft via-white to-white px-4 pt-4 pb-3 shadow-sm dark:border-game-orange-edge/30 dark:from-game-orange-soft dark:via-neutral-900 dark:to-neutral-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(255,150,0,0.18),transparent_70%)]"
        />
        <div className="relative flex flex-col items-center gap-2">
          <div className="relative">
            {status === "speaking" && (
              <motion.span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-full bg-game-orange/20 blur-xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <div className="relative scale-110 sm:scale-125">
              <KittenCharacter
                emotion={emotion}
                speaking={status === "speaking"}
              />
            </div>
          </div>

          <div className="min-h-[28px] w-full max-w-xs">
            <AnimatePresence mode="wait">
              {speakingBubble && (
                <motion.div
                  key={speakingBubble}
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  className="relative rounded-2xl border-2 border-game-orange-edge/25 bg-white px-3 py-2 text-center text-xs font-semibold text-neutral-700 shadow-[0_3px_0_0_rgba(207,116,0,0.18)] dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <span
                    aria-hidden
                    className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-game-orange-edge/25 bg-white dark:bg-neutral-900"
                  />
                  {speakingBubble}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div
        ref={transcriptRef}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain rounded-3xl border-2 border-neutral-200/70 bg-white/60 p-3 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/40"
      >
        {history.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={
              m.role === "user"
                ? "flex items-end justify-end gap-1.5"
                : "flex items-end justify-start gap-1.5"
            }
          >
            {m.role === "assistant" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-game-orange-edge/30 bg-game-orange-soft text-xs">
                🐱
              </div>
            )}
            <div
              className={
                "max-w-[78%] px-3.5 py-2 text-sm leading-snug font-medium shadow-sm " +
                (m.role === "user"
                  ? "rounded-2xl rounded-br-md border-2 border-game-cyan-edge/30 bg-game-cyan text-white"
                  : "rounded-2xl rounded-bl-md border-2 border-neutral-200 bg-white text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100")
              }
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {pendingUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.85, y: 0 }}
            className="flex items-end justify-end gap-1.5"
          >
            <div className="max-w-[78%] rounded-2xl rounded-br-md border-2 border-game-cyan-edge/30 bg-game-cyan/80 px-3.5 py-2 text-sm font-medium leading-snug text-white shadow-sm">
              {pendingUser}
            </div>
          </motion.div>
        )}

        {status === "thinking" && !streamingReply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-end justify-start gap-1.5"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-game-orange-edge/30 bg-game-orange-soft text-xs">
              🐱
            </div>
            <div className="rounded-2xl rounded-bl-md border-2 border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <span className="inline-flex gap-1">
                <motion.span
                  className="size-1.5 rounded-full bg-game-orange"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="size-1.5 rounded-full bg-game-orange"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: 0.15 }}
                />
                <motion.span
                  className="size-1.5 rounded-full bg-game-orange"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }}
                />
              </span>
            </div>
          </motion.div>
        )}

        {streamingReply !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-start gap-1.5"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-game-orange-edge/30 bg-game-orange-soft text-xs">
              🐱
            </div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-md border-2 border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium leading-snug text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
              {streamingReply}
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-3.5 w-[2px] -mb-0.5 bg-game-orange align-middle"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 pt-1 pb-4">
        <div className="relative">
          {status === "listening" && (
            <>
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-game-red/35"
                animate={{ scale: [1, 1.55, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-game-red/25"
                animate={{ scale: [1, 1.95, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
          <GameButton
            type="button"
            color={micColor}
            size="icon-lg"
            onClick={handleMicTap}
            disabled={micDisabled}
            aria-label={micLabel}
            className="relative size-20 [&_svg:not([class*='size-'])]:size-8"
          >
            {status === "listening" ? (
              <Square className="size-8 fill-white" />
            ) : status === "transcribing" ? (
              <Loader2 className="size-8 animate-spin" />
            ) : status === "thinking" ? (
              <MicOff className="size-8" />
            ) : showPlayIcon ? (
              <Play className="size-9 fill-white" />
            ) : (
              <Mic className="size-9" />
            )}
          </GameButton>
        </div>
        <p
          className={
            "text-xs font-extrabold uppercase tracking-wider " +
            (status === "listening"
              ? "text-game-red"
              : status === "speaking"
                ? "text-game-orange"
                : status === "thinking" || status === "transcribing"
                  ? "text-neutral-400"
                  : "text-neutral-500")
          }
        >
          {micLabel}
        </p>
      </div>

      <AnimatePresence>
        {currentQuiz && (
          <>
            <motion.div
              key="quiz-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 bg-linear-to-b from-transparent via-transparent to-black/15 dark:to-black/40"
            />
            <motion.div
              key="quiz-card"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="absolute bottom-32 left-2 right-2 z-30 rounded-3xl border-2 border-game-purple-edge/30 bg-white p-3 shadow-[0_10px_0_0_rgba(147,82,203,0.18)] dark:border-game-purple-edge/40 dark:bg-neutral-900"
            >
              <div className="mb-2 flex items-center justify-center gap-1.5 text-game-purple">
                <Sparkles className="size-3.5" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  English game — tap your answer
                </span>
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex flex-col gap-2">
                {currentQuiz.options.map((opt, i) => {
                  const answered = quizAnswer !== null
                  const isPicked = quizAnswer?.index === i
                  const isCorrect = i === currentQuiz.correctIndex
                  const color: "purple" | "lime" | "red" | "neutral" =
                    !answered
                      ? "purple"
                      : isCorrect
                        ? "lime"
                        : isPicked
                          ? "red"
                          : "neutral"
                  return (
                    <motion.div
                      key={`${currentQuiz.options.join("|")}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={
                        answered && isPicked && !isCorrect
                          ? { opacity: 1, x: [0, -6, 6, -4, 4, 0] }
                          : { opacity: 1, x: 0 }
                      }
                      transition={{
                        delay: answered ? 0 : 0.12 + i * 0.08,
                        duration: answered && isPicked && !isCorrect ? 0.4 : 0.3,
                      }}
                    >
                      <GameButton
                        type="button"
                        color={color}
                        size="lg"
                        disabled={answered}
                        onClick={() => answerQuiz(i)}
                        className="w-full justify-between"
                      >
                        <span className="truncate">{opt}</span>
                        {answered && isCorrect && (
                          <Check className="size-5" />
                        )}
                        {answered && isPicked && !isCorrect && (
                          <X className="size-5" />
                        )}
                      </GameButton>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
