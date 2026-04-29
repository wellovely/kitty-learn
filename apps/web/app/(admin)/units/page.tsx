import Link from "next/link"
import { createClient } from "@/lib/db/server"
import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { pickTone } from "@/lib/game-palette"
import { createUnit, createLesson, deleteUnit } from "./actions"

const inputCls =
  "h-11 rounded-2xl border-[2px] border-neutral-200 bg-white focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

export default async function UnitsAdmin() {
  const supabase = await createClient()
  const { data: units } = await supabase
    .from("units")
    .select("id, title, order_index, min_age, lessons(id, title, order_index)")
    .order("order_index")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Units &amp; lessons</h1>

      <div className="rounded-3xl border-[3px] border-game-purple-edge bg-white p-5 shadow-[0_6px_0_0_var(--game-purple-edge)] dark:bg-neutral-950">
        <h2 className="mb-3 text-lg font-bold text-game-purple-edge">New unit</h2>
        <form action={createUnit} className="grid gap-3 md:grid-cols-4 md:items-end">
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label htmlFor="title" className="font-bold">
              Title
            </Label>
            <Input id="title" name="title" required className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="orderIndex" className="font-bold">
              Order
            </Label>
            <Input
              id="orderIndex"
              name="orderIndex"
              type="number"
              min={0}
              required
              defaultValue={0}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="minAge" className="font-bold">
              Min age
            </Label>
            <Input
              id="minAge"
              name="minAge"
              type="number"
              min={3}
              max={10}
              defaultValue={3}
              className={inputCls}
            />
          </div>
          <GameButton type="submit" color="lime" size="md" className="md:col-span-4 md:w-max">
            Add unit
          </GameButton>
        </form>
      </div>

      <div className="grid gap-4">
        {(units ?? []).map((u, idx) => {
          const lessons = [...(u.lessons ?? [])].sort(
            (a, b) => a.order_index - b.order_index
          )
          const del = deleteUnit.bind(null, u.id)
          const tone = pickTone(idx)
          return (
            <div
              key={u.id}
              className={`rounded-3xl border-[3px] ${tone.edge} ${tone.bgSoft} ${tone.shadow} p-5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`text-lg font-bold ${tone.edgeText}`}>
                  {u.order_index}. {u.title}
                </span>
                <form action={del}>
                  <GameButton color="neutral" size="sm" type="submit">
                    Delete
                  </GameButton>
                </form>
              </div>
              <div className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1 text-sm">
                  {lessons.length === 0 && (
                    <li className="text-muted-foreground italic">No lessons yet.</li>
                  )}
                  {lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        className={`font-semibold ${tone.edgeText} underline-offset-4 hover:underline`}
                        href={`/lessons/${l.id}`}
                      >
                        {l.order_index}. {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <form
                  action={createLesson}
                  className="grid items-end gap-2 md:grid-cols-4"
                >
                  <input type="hidden" name="unitId" value={u.id} />
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <Label htmlFor={`lt-${u.id}`} className="font-bold">
                      New lesson
                    </Label>
                    <Input id={`lt-${u.id}`} name="title" required className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`lo-${u.id}`} className="font-bold">
                      Order
                    </Label>
                    <Input
                      id={`lo-${u.id}`}
                      name="orderIndex"
                      type="number"
                      min={0}
                      defaultValue={lessons.length + 1}
                      className={inputCls}
                    />
                  </div>
                  <GameButton type="submit" color="cyan" size="sm">
                    Add lesson
                  </GameButton>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
