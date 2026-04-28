"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Lightbulb, Send, SkipForward, Volume2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useSound } from "@/hooks/useSound"
import { useSpeech } from "@/hooks/useSpeech"
import { VoiceButton } from "./VoiceButton"

type ExerciseInput = {
  id: string
  type: "phonics" | "handwriting" | "sight_word" | "vocabulary"
  prompt: string
  voiceOnly?: boolean
}

type Props = {
  exercise: ExerciseInput
  pending: boolean
  onSubmit: (answer: string) => void
  onHint: () => void
  onSkip: () => void
}

const TYPE_INSTRUCTION: Record<
  ExerciseInput["type"],
  { label: string; how: string; voiceHow: string; emoji: string }
> = {
  phonics: {
    label: "Phonics",
    emoji: "🔤",
    how: "Listen, then type the letter or sound you hear.",
    voiceHow: "Tap the mic and say the letter or sound out loud.",
  },
  handwriting: {
    label: "Spell it",
    emoji: "✏️",
    how: "Type the word — letter by letter.",
    voiceHow: "Tap the mic and spell the word out loud.",
  },
  sight_word: {
    label: "Sight word",
    emoji: "👀",
    how: "Read the word and type it back, or tap the mic.",
    voiceHow: "Tap the mic and read the word out loud.",
  },
  vocabulary: {
    label: "Vocabulary",
    emoji: "📚",
    how: "Type the word that matches, or say it out loud.",
    voiceHow: "Tap the mic and say the word.",
  },
}

export function ExerciseCard({ exercise, pending, onSubmit, onHint, onSkip }: Props) {
  const [voiceAnswer, setVoiceAnswer] = useState<string | null>(null)
  const { play } = useSound()
  const speech = useSpeech()
  const { register, handleSubmit, setValue, watch, reset } = useForm<{
    answer: string
  }>({ defaultValues: { answer: "" } })
  const answer = watch("answer")
  const meta = TYPE_INSTRUCTION[exercise.type]
  const voiceOnly = exercise.voiceOnly === true

  function submit(values: { answer: string }) {
    const text = values.answer.trim()
    if (!text) return
    play("click")
    onSubmit(text)
    reset()
    setVoiceAnswer(null)
  }

  function handleVoice(text: string) {
    play("pop")
    if (voiceOnly) {
      setVoiceAnswer(text)
      onSubmit(text)
      return
    }
    setVoiceAnswer(text)
    setValue("answer", text)
  }

  function speakPrompt() {
    play("click")
    speech.speak(exercise.prompt)
  }

  return (
    <div className="relative rounded-[28px] border-4 border-white/80 bg-gradient-to-br from-white to-amber-50 p-5 shadow-xl dark:from-neutral-900 dark:to-neutral-950">
      <div className="mb-3 flex flex-col items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          <span className="text-sm leading-none">{meta.emoji}</span>
          {voiceOnly ? `${meta.label} · Voice` : meta.label}
        </span>
        <p className="text-muted-foreground text-center text-xs">
          {voiceOnly ? meta.voiceHow : meta.how}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <p className="text-center text-2xl font-bold leading-snug">
          {exercise.prompt}
        </p>
        {speech.supported && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={speakPrompt}
            disabled={pending}
            aria-label="Hear the prompt"
            className="rounded-full text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <Volume2 className={speech.speaking ? "animate-pulse" : ""} />
          </Button>
        )}
      </div>

      {voiceOnly ? (
        <div className="mt-5 flex flex-col items-center gap-4">
          <VoiceButton onTranscript={handleVoice} />
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                play("pop")
                onHint()
              }}
              disabled={pending}
              className="flex-1 rounded-full"
            >
              <Lightbulb />
              Hint
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                play("pop")
                onSkip()
              }}
              disabled={pending}
              className="flex-1 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <SkipForward />
              Can&apos;t speak now
            </Button>
          </div>
          {voiceAnswer && !pending && (
            <p className="text-muted-foreground text-center text-xs">
              Heard: &ldquo;{voiceAnswer}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(submit)} className="mt-4 flex flex-col gap-3">
          <Input
            placeholder="Type your answer or tap the mic…"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            className="h-14 rounded-full border-2 border-amber-200 bg-white text-center text-xl font-semibold focus-visible:border-amber-400 dark:border-amber-900 dark:bg-neutral-950"
            {...register("answer")}
          />
          <div className="flex items-center justify-between gap-2">
            <VoiceButton onTranscript={handleVoice} />
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                play("pop")
                onHint()
              }}
              disabled={pending}
              className="rounded-full"
            >
              <Lightbulb />
              Hint
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={pending || !answer.trim()}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-neutral-300"
            >
              {pending ? "…" : (
                <>
                  <Send />
                  Go
                </>
              )}
            </Button>
          </div>
          {voiceAnswer && !pending && (
            <p className="text-muted-foreground text-center text-xs">
              Heard: &ldquo;{voiceAnswer}&rdquo;
            </p>
          )}
        </form>
      )}
    </div>
  )
}
