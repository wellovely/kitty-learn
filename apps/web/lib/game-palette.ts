export type GameColor =
  | "lime"
  | "orange"
  | "cyan"
  | "purple"
  | "red"
  | "amber"

type Tone = {
  bg: string
  bgSoft: string
  edge: string
  edgeText: string
  shadow: string
}

export const GAME_TONES: Record<GameColor, Tone> = {
  lime: {
    bg: "bg-game-lime",
    bgSoft: "bg-game-lime-soft",
    edge: "border-game-lime-edge",
    edgeText: "text-game-lime-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-lime-edge)]",
  },
  orange: {
    bg: "bg-game-orange",
    bgSoft: "bg-game-orange-soft",
    edge: "border-game-orange-edge",
    edgeText: "text-game-orange-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-orange-edge)]",
  },
  cyan: {
    bg: "bg-game-cyan",
    bgSoft: "bg-game-cyan-soft",
    edge: "border-game-cyan-edge",
    edgeText: "text-game-cyan-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-cyan-edge)]",
  },
  purple: {
    bg: "bg-game-purple",
    bgSoft: "bg-game-purple-soft",
    edge: "border-game-purple-edge",
    edgeText: "text-game-purple-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-purple-edge)]",
  },
  red: {
    bg: "bg-game-red",
    bgSoft: "bg-game-red-soft",
    edge: "border-game-red-edge",
    edgeText: "text-game-red-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-red-edge)]",
  },
  amber: {
    bg: "bg-game-amber",
    bgSoft: "bg-game-amber-soft",
    edge: "border-game-amber-edge",
    edgeText: "text-game-amber-edge",
    shadow: "shadow-[0_6px_0_0_var(--game-amber-edge)]",
  },
}

const ROTATION: GameColor[] = ["lime", "orange", "cyan", "purple", "red"]

export function pickTone(index: number): Tone {
  return GAME_TONES[ROTATION[index % ROTATION.length]!]
}
