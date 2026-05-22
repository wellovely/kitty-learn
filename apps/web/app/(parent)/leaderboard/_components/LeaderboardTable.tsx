import { GAME_TONES } from "@/lib/game-palette"
import type { LeaderboardEntry } from "@/lib/services/leaderboard"

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const rest = entries.slice(3)
  if (rest.length === 0) return null

  return (
    <section aria-label="Leaderboard ranks 4 and below">
      <ol className="flex flex-col divide-y divide-border overflow-hidden rounded-3xl border-[3px] border-neutral-200">
        {rest.map((entry) => {
          const tone = entry.isMine ? GAME_TONES["lime"] : null
          return (
            <li
              key={entry.childId}
              className={`flex items-center gap-3 px-4 py-3 ${entry.isMine ? "bg-game-lime-soft/50" : "bg-white dark:bg-neutral-950"}`}
            >
              <span
                className={`w-7 shrink-0 text-right text-sm font-bold tabular-nums ${entry.isMine ? "text-game-lime-edge" : "text-muted-foreground"}`}
              >
                {entry.rank}
              </span>
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tone ? `${tone.bg} border-2 ${tone.edge}` : "bg-neutral-300 dark:bg-neutral-600"}`}
              >
                {entry.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {entry.name}
                {entry.isMine ? (
                  <span className="ml-2 rounded-full border border-game-lime-edge bg-game-lime-soft px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-game-lime-edge">
                    You
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-muted-foreground">
                {entry.totalXp} XP
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
