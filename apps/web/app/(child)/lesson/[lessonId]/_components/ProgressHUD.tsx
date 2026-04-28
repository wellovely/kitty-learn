import { Progress } from "@workspace/ui/components/progress"
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
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="rounded-full bg-white px-2.5 py-0.5 text-amber-700 shadow-sm dark:bg-neutral-900 dark:text-amber-300">
          {Math.min(index + 1, total)} / {total}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <Star className="size-3 fill-amber-500 text-amber-500" strokeWidth={0} />
          {correct}
        </span>
      </div>
      <Progress value={pct} className="h-2.5" />
    </div>
  )
}
