import { createClient } from "@/lib/db/server"

export type LessonAccess = "ok" | "not_found" | "locked"

/**
 * Pure unlock check. First lesson is always open; each next lesson is open
 * when every previous lesson (flat across units in order_index order) has
 * at least 1 star. Used to gate /lesson/[id] and progress submission.
 */
export function isLessonUnlocked(args: {
  flatLessonIds: readonly string[]
  targetId: string
  starsByLesson: ReadonlyMap<string, number>
}): LessonAccess {
  const idx = args.flatLessonIds.indexOf(args.targetId)
  if (idx === -1) return "not_found"
  for (let i = 0; i < idx; i++) {
    const prereq = args.flatLessonIds[i]!
    if ((args.starsByLesson.get(prereq) ?? 0) < 1) return "locked"
  }
  return "ok"
}

/**
 * DB-backed gate for a (child, lesson) pair. Does NOT verify parent
 * ownership — call requireParentOfChild first.
 */
export async function checkLessonAccess(args: {
  childId: string
  lessonId: string
}): Promise<LessonAccess> {
  const supabase = await createClient()

  const [{ data: units, error: unitsErr }, { data: progress, error: progressErr }] =
    await Promise.all([
      supabase
        .from("units")
        .select("id, order_index, lessons(id, order_index)")
        .order("order_index"),
      supabase
        .from("progress")
        .select("lesson_id, stars")
        .eq("child_id", args.childId),
    ])
  if (unitsErr) throw unitsErr
  if (progressErr) throw progressErr

  const flatLessonIds: string[] = []
  for (const u of units ?? []) {
    const ls = [...(u.lessons ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    )
    for (const l of ls) flatLessonIds.push(l.id)
  }

  const starsByLesson = new Map<string, number>(
    (progress ?? []).map((p) => [p.lesson_id, p.stars])
  )

  return isLessonUnlocked({
    flatLessonIds,
    targetId: args.lessonId,
    starsByLesson,
  })
}
