"use client"

import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Headphones, Lightbulb, Send, SkipForward, Volume2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { useSound } from "@/hooks/useSound"
import { useSpeech } from "@/hooks/useSpeech"
import { VoiceButton } from "./VoiceButton"
import { MatchPairsBoard } from "./MatchPairsBoard"

type ExerciseInput = {
  id: string
  type: "phonics" | "handwriting" | "sight_word" | "vocabulary" | "match_pairs"
  prompt: string
  voiceOnly?: boolean
  assets?: { imageUrl?: string; audioUrl?: string } | null
  pairs?: { left: string; right: string }[]
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
  match_pairs: {
    label: "Match pairs",
    emoji: "🧩",
    how: "Drag each word onto the picture it matches.",
    voiceHow: "Drag each word onto the picture it matches.",
  },
}

export function ExerciseCard({ exercise, pending, onSubmit, onHint, onSkip }: Props) {
  const [voiceAnswer, setVoiceAnswer] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { play } = useSound()
  const speech = useSpeech()
  const { register, handleSubmit, setValue, watch, reset } = useForm<{
    answer: string
  }>({ defaultValues: { answer: "" } })
  const answer = watch("answer")
  const meta = TYPE_INSTRUCTION[exercise.type]
  const voiceOnly = exercise.voiceOnly === true
  const imageUrl = exercise.assets?.imageUrl
  const audioUrl = exercise.assets?.audioUrl
  const isMatchPairs = exercise.type === "match_pairs"

  function playAudioAsset() {
    if (!audioUrl) return
    play("click")
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    void el.play().catch(() => {})
  }

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
    <div className="relative rounded-[28px] border-[3px] border-game-cyan-edge bg-white p-5 shadow-[0_6px_0_0_var(--game-cyan-edge)] dark:bg-neutral-950">
      <div className="mb-3 flex flex-col items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-game-amber-edge">
          <span className="text-sm leading-none">{meta.emoji}</span>
          {voiceOnly ? `${meta.label} · Voice` : meta.label}
        </span>
        <p className="text-muted-foreground text-center text-xs">
          {voiceOnly ? meta.voiceHow : meta.how}
        </p>
      </div>

      {imageUrl && (
        <div className="mb-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={exercise.prompt}
            className="max-h-44 w-auto rounded-2xl border-[3px] border-game-orange-edge bg-white object-contain p-1 shadow-[0_4px_0_0_var(--game-orange-edge)]"
          />
        </div>
      )}

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
        {audioUrl && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={playAudioAsset}
            disabled={pending}
            aria-label="Play recorded audio"
            className="rounded-full text-game-cyan-edge hover:bg-game-cyan-soft"
          >
            <Headphones />
          </Button>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          className="hidden"
        />
      )}

      {isMatchPairs && exercise.pairs && exercise.pairs.length > 0 ? (
        <div className="mt-4">
          <MatchPairsBoard
            pairs={exercise.pairs}
            pending={pending}
            onComplete={() => onSubmit("match_complete")}
            onHint={onHint}
            onSkip={onSkip}
          />
        </div>
      ) : voiceOnly ? (
        <div className="mt-5 flex flex-col items-center gap-4">
          <VoiceButton onTranscript={handleVoice} />
          <div className="flex w-full items-center justify-between gap-2">
            <GameButton
              type="button"
              color="amber"
              size="md"
              onClick={() => {
                play("pop")
                onHint()
              }}
              disabled={pending}
              className="flex-1"
            >
              <Lightbulb />
              Hint
            </GameButton>
            <GameButton
              type="button"
              color="neutral"
              size="md"
              onClick={() => {
                play("pop")
                onSkip()
              }}
              disabled={pending}
              className="flex-1"
            >
              <SkipForward />
              Can&apos;t speak now
            </GameButton>
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
            className="h-14 rounded-2xl border-[3px] border-game-cyan bg-white text-center text-xl font-semibold focus-visible:border-game-cyan-edge focus-visible:ring-0 dark:bg-neutral-950"
            {...register("answer")}
          />
          <div className="flex items-center justify-between gap-2">
            <VoiceButton onTranscript={handleVoice} />
            <GameButton
              type="button"
              color="amber"
              size="md"
              onClick={() => {
                play("pop")
                onHint()
              }}
              disabled={pending}
            >
              <Lightbulb />
              Hint
            </GameButton>
            <GameButton
              type="submit"
              color="lime"
              size="md"
              disabled={pending || !answer.trim()}
            >
              {pending ? "…" : (
                <>
                  <Send />
                  Go
                </>
              )}
            </GameButton>
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
