import { Star } from "lucide-react"

export function ProgressHUD({
  index,
  total,
  correct,
}: {
  index: number
  total: number
  correct: number
}) {
  const pct = total === 0 ? 0 : Math.round(((index + 1) / total) * 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="rounded-full border-[2px] border-game-cyan-edge bg-game-cyan-soft px-2.5 py-0.5 text-game-cyan-edge">
          {Math.min(index + 1, total)} / {total}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-2.5 py-0.5 text-game-amber-edge">
          <Star className="size-3 fill-game-amber text-game-amber-edge" strokeWidth={0} />
          {correct}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full border-[2px] border-game-lime-edge bg-white">
        <div
          className="h-full rounded-full bg-game-lime transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
