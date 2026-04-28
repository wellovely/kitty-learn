"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Flame, Star } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { Emotion, EvaluationResult } from "@/lib/ai/schemas"
import { useLessonUI } from "@/stores/lesson-ui"
import { useSound } from "@/hooks/useSound"
import { useSpeech } from "@/hooks/useSpeech"
import { SoundToggle } from "@/components/shared/SoundToggle"
import { KittenCharacter } from "./KittenCharacter"
import { ExerciseCard } from "./ExerciseCard"
import { ProgressHUD } from "./ProgressHUD"

type ExerciseInput = {
  id: string
  type: "phonics" | "handwriting" | "sight_word" | "vocabulary"
  prompt: string
  orderIndex: number
  expected: { answer: string; alternatives?: string[]; voiceOnly?: boolean }
}

type Props = {
  lessonId: string
  lessonTitle: string
  childId: string
  exercises: ExerciseInput[]
}

export function LessonPlayer({ lessonId, lessonTitle, childId, exercises }: Props) {
  const router = useRouter()
  const { play } = useSound()
  const speech = useSpeech()
  const {
    currentIndex,
    correctCount,
    emotion,
    lastFeedback,
    next,
    markCorrect,
    setEmotion,
    setFeedback,
    reset,
  } = useLessonUI()
  const [pending, setPending] = useState(false)
  const [skippedCount, setSkippedCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [summary, setSummary] = useState<{
    stars: number
    xpEarned: number
    totalXp: number
    streakDays: number
    newBadges: { code: string; title: string; icon: string }[]
  } | null>(null)

  useEffect(() => {
    reset()
  }, [lessonId, reset])

  const total = exercises.length
  const current = exercises[currentIndex]

  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => speech.speak(current.prompt), 200)
    return () => clearTimeout(t)
  }, [current?.id, speech.speak])

  async function handleAnswer(answer: string) {
    if (!current) return
    setPending(true)
    setEmotion("thinking")
    try {
      const res = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          exerciseId: current.id,
          answer,
        }),
      })
      if (!res.ok) throw new Error("evaluate failed")
      const result = (await res.json()) as EvaluationResult
      setEmotion(result.emotion as Emotion)
      setFeedback(result.feedback)
      if (result.isCorrect) {
        markCorrect()
        play("correct")
        toast.success(result.feedback)
        speech.speak(result.feedback)
      } else {
        play("wrong")
        toast(result.feedback, {
          description: result.hint ?? undefined,
        })
        speech.speak(result.feedback)
      }
      await new Promise((r) => setTimeout(r, 900))

      if (currentIndex + 1 >= total) {
        await submitProgress(result.isCorrect ? 1 : 0)
      } else {
        next()
        setEmotion("idle")
      }
    } catch {
      toast.error("Something went wrong — try again")
      setEmotion("confused")
    } finally {
      setPending(false)
    }
  }

  async function submitProgress(lastAdd: number, lastSkip = 0) {
    const totalSkipped = skippedCount + lastSkip
    const effectiveTotal = Math.max(1, total - totalSkipped)
    const res = await fetch("/api/progress/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        lessonId,
        correctCount: correctCount + lastAdd,
        totalCount: effectiveTotal,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setSummary(data)
      setFinished(true)
      setEmotion("excited")
      play("complete")
      if (data.newBadges?.length) {
        setTimeout(() => play("unlock"), 700)
      }
    }
  }

  async function handleSkip() {
    if (!current || pending) return
    play("pop")
    setEmotion("idle")
    setFeedback("No worries — let's try the next one!")
    setSkippedCount((c) => c + 1)
    await new Promise((r) => setTimeout(r, 500))
    if (currentIndex + 1 >= total) {
      await submitProgress(0, 1)
    } else {
      next()
      setEmotion("idle")
    }
  }

  async function handleHint() {
    if (!current) return
    setPending(true)
    setEmotion("thinking")
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, exerciseId: current.id }),
      })
      if (!res.ok) throw new Error("hint failed")
      const { hint, emotion: e } = await res.json()
      setEmotion(e as Emotion)
      toast(hint)
      speech.speak(hint)
    } catch {
      toast.error("Can't fetch a hint right now")
    } finally {
      setPending(false)
    }
  }

  if (finished && summary) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
        <KittenCharacter emotion="excited" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Complete
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lesson done
          </h1>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => {
            const earned = i <= summary.stars
            return (
              <span
                key={i}
                className={earned ? "animate-bounce" : "opacity-25"}
                style={{ animationDelay: `${i * 120}ms` }}
                onAnimationStart={() => earned && play("star")}
              >
                <Star
                  className={cn(
                    "size-9",
                    earned
                      ? "fill-amber-400 text-amber-400"
                      : "fill-neutral-300 text-neutral-300"
                  )}
                  strokeWidth={0}
                />
              </span>
            )
          })}
        </div>
        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
            +{summary.xpEarned} XP
          </span>
          <span className="h-3 w-px bg-neutral-200 dark:bg-neutral-700" />
          <span className="inline-flex items-center gap-1.5">
            <Flame className="size-3.5 text-rose-500" />
            {summary.streakDays}
          </span>
        </div>
        {summary.newBadges.length > 0 && (
          <Card className="w-full">
            <CardContent className="flex flex-col gap-2 pt-6">
              <p className="font-medium">New badges!</p>
              {summary.newBadges.map((b) => (
                <div key={b.code} className="flex items-center gap-2">
                  <span className="text-2xl">{b.icon}</span>
                  <span>{b.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <Button
          onClick={() => {
            reset()
            router.push(`/home?childId=${childId}`)
          }}
        >
          Back to home
        </Button>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2 shadow-sm backdrop-blur-md dark:bg-neutral-900/70">
        <button
          type="button"
          onClick={() => {
            play("click")
            router.push(`/home?childId=${childId}`)
          }}
          className="text-muted-foreground text-sm underline"
        >
          ← Quit
        </button>
        <h1 className="text-base font-bold">{lessonTitle}</h1>
        <SoundToggle />
      </header>
      <ProgressHUD index={currentIndex} total={total} correct={correctCount} />
      <div className="flex flex-col items-center gap-2 py-2">
        <KittenCharacter emotion={emotion} speaking={speech.speaking} />
        {lastFeedback && (
          <div className="relative max-w-sm rounded-2xl bg-white px-4 py-2 text-center text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-amber-100 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-amber-900/40">
            <span
              aria-hidden="true"
              className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-amber-100 dark:bg-neutral-900 dark:ring-amber-900/40"
            />
            {lastFeedback}
          </div>
        )}
      </div>
      <ExerciseCard
        exercise={{
          id: current.id,
          type: current.type,
          prompt: current.prompt,
          voiceOnly: current.expected.voiceOnly === true,
        }}
        pending={pending}
        onSubmit={handleAnswer}
        onHint={handleHint}
        onSkip={handleSkip}
      />
    </div>
  )
}
