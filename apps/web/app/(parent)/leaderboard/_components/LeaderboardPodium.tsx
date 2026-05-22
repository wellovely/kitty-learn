import { GAME_TONES, type GameColor } from "@/lib/game-palette"
import type { LeaderboardEntry } from "@/lib/services/leaderboard"

const PLACE_META: Record<
  1 | 2 | 3,
  { color: GameColor; stepHeight: number }
> = {
  1: { color: "amber",  stepHeight: 120 },
  2: { color: "cyan",   stepHeight: 72  },
  3: { color: "orange", stepHeight: 40  },
}

function PodiumSlot({
  place,
  entry,
}: {
  place: 1 | 2 | 3
  entry: LeaderboardEntry | undefined
}) {
  const meta = PLACE_META[place]
  const tone = GAME_TONES[meta.color]

  if (!entry) return <div className="w-28 shrink-0" aria-hidden />

  const initial = entry.name?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="flex w-28 shrink-0 flex-col items-center sm:w-36">
      {/* Info above the step */}
      <div className="mb-3 flex flex-col items-center gap-1.5 px-1">
        <div
          className={`flex aspect-square size-11 items-center justify-center w-10 h-10 rounded-full border-[3px] text-base font-bold text-white sm:size-13 ${tone.edge} ${tone.bg} ${entry.isMine ? "ring-2 ring-game-lime-edge ring-offset-1" : ""}`}
        >
          {initial}
        </div>
        <span className="w-full truncate text-center text-xs font-bold leading-tight">
          {entry.name}
        </span>
        <span className={`text-xs font-bold tabular-nums ${tone.edgeText}`}>
          {entry.totalXp} XP
        </span>
        {entry.isMine ? (
          <span className="rounded-full border border-game-lime-edge bg-game-lime-soft px-2 py-px text-[6px] font-bold tracking-wide text-game-lime-edge">
            Your child
          </span>
        ) : null}
      </div>

      {/* Podium step */}
      <div
        className={`flex w-full items-start justify-center rounded-t-2xl border-[3px] border-b-0 pt-2.5 ${tone.edge} ${tone.bg} ${tone.shadow}`}
        style={{ height: meta.stepHeight }}
      >
        <span className="text-sm font-bold text-white">{place}</span>
      </div>
    </div>
  )
}

export function LeaderboardPodium({ entries }: { entries: LeaderboardEntry[] }) {
  const first = entries[0]
  const second = entries[1]
  const third = entries[2]

  if (!first && !second && !third) return null

  return (
    <section aria-label="Top 3 learners">
      <div className="flex items-end justify-center gap-3">
        <PodiumSlot place={2} entry={second} />
        <PodiumSlot place={1} entry={first} />
        <PodiumSlot place={3} entry={third} />
      </div>
    </section>
  )
}
