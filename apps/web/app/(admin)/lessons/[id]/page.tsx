import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { pickTone } from "@/lib/game-palette"
import {
  createExercise,
  deleteExercise,
  deleteLesson,
} from "./actions"

const inputCls =
  "h-11 rounded-2xl border-[2px] border-neutral-200 bg-white focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

export default async function LessonAdmin({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, title, unit_id, exercises(id, type, prompt, expected, assets, order_index)"
    )
    .eq("id", id)
    .single()
  if (!lesson) notFound()

  const exercises = [...(lesson.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  const del = deleteLesson.bind(null, lesson.id, lesson.unit_id)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <Link
            href="/units"
            className="text-sm font-bold text-game-purple-edge underline-offset-4 hover:underline"
          >
            ← Units
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
        </div>
        <form action={del}>
          <GameButton color="red" type="submit" size="sm">
            Delete lesson
          </GameButton>
        </form>
      </header>

      <div className="rounded-3xl border-[3px] border-game-cyan-edge bg-game-cyan-soft p-5 shadow-[0_6px_0_0_var(--game-cyan-edge)]">
        <h2 className="mb-3 text-lg font-bold text-game-cyan-edge">Exercises</h2>
        <div className="flex flex-col gap-3">
          {exercises.length === 0 && (
            <p className="text-sm font-semibold italic text-game-cyan-edge">
              No exercises yet.
            </p>
          )}
          {exercises.map((e, i) => {
            const expected = e.expected as {
              answer?: string
              alternatives?: string[]
              voiceOnly?: boolean
            }
            const assets = (e.assets ?? null) as {
              imageUrl?: string
              audioUrl?: string
            } | null
            const delEx = deleteExercise.bind(null, e.id, lesson.id)
            const tone = pickTone(i)
            return (
              <div
                key={e.id}
                className={`flex items-start justify-between gap-3 rounded-2xl border-[3px] ${tone.edge} bg-white p-4 dark:bg-neutral-950`}
              >
                <div className="flex flex-col gap-1 text-sm">
                  <p className="font-bold">
                    <span className={tone.edgeText}>{e.order_index}.</span> {e.prompt}
                  </p>
                  <p className="text-muted-foreground">
                    {e.type} · answer: {expected?.answer}
                    {expected?.alternatives?.length
                      ? ` (alts: ${expected.alternatives.join(", ")})`
                      : ""}
                  </p>
                  {(expected?.voiceOnly || assets?.imageUrl || assets?.audioUrl) && (
                    <div className="flex flex-wrap gap-1">
                      {expected?.voiceOnly && (
                        <span className="rounded-full border-[2px] border-game-purple-edge bg-game-purple-soft px-2 py-0.5 text-[11px] font-bold text-game-purple-edge">
                          🎤 voice only
                        </span>
                      )}
                      {assets?.imageUrl && (
                        <span className="rounded-full border-[2px] border-game-orange-edge bg-game-orange-soft px-2 py-0.5 text-[11px] font-bold text-game-orange-edge">
                          🖼 image
                        </span>
                      )}
                      {assets?.audioUrl && (
                        <span className="rounded-full border-[2px] border-game-cyan-edge bg-game-cyan-soft px-2 py-0.5 text-[11px] font-bold text-game-cyan-edge">
                          🔊 audio
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <form action={delEx}>
                  <GameButton color="neutral" size="sm" type="submit">
                    Delete
                  </GameButton>
                </form>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border-[3px] border-game-lime-edge bg-white p-5 shadow-[0_6px_0_0_var(--game-lime-edge)] dark:bg-neutral-950">
        <h2 className="mb-3 text-lg font-bold text-game-lime-edge">Add exercise</h2>
        <form
          action={createExercise}
          className="grid gap-3 md:grid-cols-2 md:items-end"
        >
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="type" className="font-bold">
              Type
            </Label>
            <select
              id="type"
              name="type"
              className="h-11 rounded-2xl border-[2px] border-neutral-200 bg-white px-3 text-sm font-semibold focus-visible:border-game-cyan focus-visible:outline-none dark:bg-neutral-950"
              defaultValue="phonics"
            >
              <option value="phonics">Phonics</option>
              <option value="handwriting">Handwriting</option>
              <option value="sight_word">Sight Word</option>
              <option value="vocabulary">Vocabulary</option>
            </select>
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
              defaultValue={exercises.length + 1}
              required
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label htmlFor="prompt" className="font-bold">
              Prompt
            </Label>
            <Input id="prompt" name="prompt" required maxLength={500} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="answer" className="font-bold">
              Expected answer
            </Label>
            <Input id="answer" name="answer" required maxLength={200} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="alternatives" className="font-bold">
              Alternatives (comma-separated)
            </Label>
            <Input id="alternatives" name="alternatives" maxLength={500} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="imageUrl" className="font-bold">
              Image URL (optional)
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              maxLength={500}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="audioUrl" className="font-bold">
              Audio URL (optional)
            </Label>
            <Input
              id="audioUrl"
              name="audioUrl"
              type="url"
              maxLength={500}
              placeholder="https://…"
              className={inputCls}
            />
          </div>
          <label
            htmlFor="voiceOnly"
            className="flex cursor-pointer items-center gap-2 md:col-span-2"
          >
            <input
              type="checkbox"
              id="voiceOnly"
              name="voiceOnly"
              className="size-5 cursor-pointer accent-game-purple"
            />
            <span className="font-bold">
              Voice only{" "}
              <span className="font-normal text-muted-foreground">
                — child must answer by voice (no text input)
              </span>
            </span>
          </label>
          <GameButton type="submit" color="lime" size="md" className="md:col-span-2 md:w-max">
            Add exercise
          </GameButton>
        </form>
      </div>
    </div>
  )
}
