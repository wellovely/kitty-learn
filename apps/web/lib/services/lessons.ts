import { createClient } from "@/lib/db/server"
import type { ExpectedAnswer } from "@/lib/ai/schemas"

export async function listUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("units")
    .select("id, title, order_index, min_age")
    .order("order_index", { ascending: true })
  if (error) throw error
  return data
}

export async function getUnit(unitId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("units")
    .select("id, title, order_index, min_age, lessons(id, title, order_index)")
    .eq("id", unitId)
    .single()
  if (error) throw error
  return data
}

export async function getLesson(lessonId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, title, order_index, unit_id, exercises(id, type, prompt, expected, assets, order_index)"
    )
    .eq("id", lessonId)
    .single()
  if (error) throw error
  const exercises = [...(data.exercises ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  )
  return { ...data, exercises }
}

export async function getExercise(exerciseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("exercises")
    .select("id, type, prompt, expected, lesson_id")
    .eq("id", exerciseId)
    .single()
  if (error || !data) throw new Response("Exercise not found", { status: 404 })
  return {
    ...data,
    expected: data.expected as unknown as ExpectedAnswer,
  }
}
