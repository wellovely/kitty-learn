"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Flame, Star } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { GameButton } from "@workspace/ui/components/game-button"
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
        <div className="w-full max-w-sm rounded-3xl border-[3px] border-game-lime-edge bg-game-lime-soft px-6 py-7 shadow-[0_6px_0_0_var(--game-lime-edge)]">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-game-lime-edge">
              Complete
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Lesson done
            </h1>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => {
                const earned = i <= summary.stars
                return (
                  <span
                    key={i}
                    className={cn(earned ? "animate-[pop_0.36s_cubic-bezier(0.34,1.56,0.64,1)_both]" : "opacity-25")}
                    style={{ animationDelay: `${i * 120}ms` }}
                    onAnimationStart={() => earned && play("star")}
                  >
                    <Star
                      className={cn(
                        "size-10",
                        earned
                          ? "fill-game-amber text-game-amber-edge"
                          : "fill-neutral-300 text-neutral-300"
                      )}
                      strokeWidth={0}
                    />
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-3 py-1 text-sm font-bold text-game-amber-edge">
            <Star className="size-3.5 fill-game-amber text-game-amber-edge" strokeWidth={0} />
            +{summary.xpEarned} XP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-game-red-edge bg-game-red-soft px-3 py-1 text-sm font-bold text-game-red-edge">
            <Flame className="size-3.5" />
            {summary.streakDays}
          </span>
        </div>
        {summary.newBadges.length > 0 && (
          <Card className="w-full border-[3px] border-game-purple-edge bg-game-purple-soft shadow-[0_6px_0_0_var(--game-purple-edge)]">
            <CardContent className="flex flex-col gap-2 pt-6">
              <p className="font-bold text-game-purple-edge">New badges!</p>
              {summary.newBadges.map((b) => (
                <div key={b.code} className="flex items-center gap-2">
                  <span className="text-2xl">{b.icon}</span>
                  <span>{b.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <GameButton
          color="lime"
          size="lg"
          onClick={() => {
            reset()
            router.push(`/home?childId=${childId}`)
          }}
        >
          Back to home
        </GameButton>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between rounded-full border-[2px] border-game-cyan-edge bg-white px-4 py-2 shadow-[0_4px_0_0_var(--game-cyan-edge)] dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => {
            play("click")
            router.push(`/home?childId=${childId}`)
          }}
          className="rounded-full px-2 py-0.5 text-sm font-bold text-game-cyan-edge hover:bg-game-cyan-soft"
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
          <div className="relative max-w-sm rounded-2xl border-[2px] border-game-amber-edge bg-game-amber-soft px-4 py-2 text-center text-sm font-semibold text-neutral-800 shadow-[0_4px_0_0_var(--game-amber-edge)] dark:text-neutral-100">
            <span
              aria-hidden="true"
              className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-l-[2px] border-t-[2px] border-game-amber-edge bg-game-amber-soft"
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
