import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/db/server"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  createExercise,
  deleteExercise,
  deleteLesson,
} from "./actions"

export default async function LessonAdmin({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, unit_id, exercises(id, type, prompt, expected, order_index)")
    .eq("id", id)
    .single()
  if (!lesson) notFound()

  const exercises = [...(lesson.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  const del = deleteLesson.bind(null, lesson.id, lesson.unit_id)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <Link href="/units" className="text-muted-foreground text-sm underline">
            ← Units
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
        </div>
        <form action={del}>
          <Button variant="destructive" type="submit" size="sm">
            Delete lesson
          </Button>
        </form>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {exercises.length === 0 && (
            <p className="text-muted-foreground text-sm">No exercises yet.</p>
          )}
          {exercises.map((e) => {
            const expected = e.expected as { answer?: string; alternatives?: string[] }
            const delEx = deleteExercise.bind(null, e.id, lesson.id)
            return (
              <div
                key={e.id}
                className="border rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div className="text-sm">
                  <p className="font-medium">{e.order_index}. {e.prompt}</p>
                  <p className="text-muted-foreground">
                    {e.type} · answer: {expected?.answer}
                    {expected?.alternatives?.length
                      ? ` (alts: ${expected.alternatives.join(", ")})`
                      : ""}
                  </p>
                </div>
                <form action={delEx}>
                  <Button variant="ghost" size="sm" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createExercise}
            className="grid gap-3 md:grid-cols-2 md:items-end"
          >
            <input type="hidden" name="lessonId" value={lesson.id} />
            <div className="flex flex-col gap-1">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                className="border rounded-md h-9 px-3 text-sm"
                defaultValue="phonics"
              >
                <option value="phonics">Phonics</option>
                <option value="handwriting">Handwriting</option>
                <option value="sight_word">Sight Word</option>
                <option value="vocabulary">Vocabulary</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="orderIndex">Order</Label>
              <Input
                id="orderIndex"
                name="orderIndex"
                type="number"
                min={0}
                defaultValue={exercises.length + 1}
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input id="prompt" name="prompt" required maxLength={500} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="answer">Expected answer</Label>
              <Input id="answer" name="answer" required maxLength={200} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="alternatives">Alternatives (comma-separated)</Label>
              <Input id="alternatives" name="alternatives" maxLength={500} />
            </div>
            <Button type="submit" className="md:col-span-2 md:w-max">
              Add exercise
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
