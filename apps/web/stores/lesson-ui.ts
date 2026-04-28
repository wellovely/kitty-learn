import { create } from "zustand"
import type { Emotion } from "@/lib/ai/schemas"

type LessonUIState = {
  currentIndex: number
  correctCount: number
  emotion: Emotion
  hintVisible: boolean
  lastFeedback: string | null
  setIndex: (i: number) => void
  next: () => void
  markCorrect: () => void
  setEmotion: (e: Emotion) => void
  setFeedback: (text: string | null) => void
  showHint: (v: boolean) => void
  reset: () => void
}

const INITIAL = {
  currentIndex: 0,
  correctCount: 0,
  emotion: "idle" as Emotion,
  hintVisible: false,
  lastFeedback: null as string | null,
}

export const useLessonUI = create<LessonUIState>((set) => ({
  ...INITIAL,
  setIndex: (i) => set({ currentIndex: i }),
  next: () => set((s) => ({ currentIndex: s.currentIndex + 1 })),
  markCorrect: () => set((s) => ({ correctCount: s.correctCount + 1 })),
  setEmotion: (emotion) => set({ emotion }),
  setFeedback: (lastFeedback) => set({ lastFeedback }),
  showHint: (hintVisible) => set({ hintVisible }),
  reset: () => set({ ...INITIAL }),
}))
