import { notFound, redirect } from "next/navigation"
import { requireParentOfChild } from "@/lib/auth/session"
import { getLesson } from "@/lib/services/lessons"
import { checkLessonAccess } from "@/lib/services/lesson-access"
import { ExpectedAnswer, ExerciseAssets } from "@/lib/ai/schemas"
import { LessonPlayer } from "./_components/LessonPlayer"

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ childId?: string }>
}) {
  const { lessonId } = await params
  const { childId } = await searchParams
  if (!childId) notFound()

  await requireParentOfChild(childId)

  const access = await checkLessonAccess({ childId, lessonId })
  if (access === "not_found") notFound()
  if (access === "locked") redirect(`/home?childId=${childId}`)

  const lesson = await getLesson(lessonId).catch(() => null)
  if (!lesson || lesson.exercises.length === 0) notFound()

  const exercises = lesson.exercises.map((e) => ({
    id: e.id,
    type: e.type as
      | "phonics"
      | "handwriting"
      | "sight_word"
      | "vocabulary"
      | "match_pairs",
    prompt: e.prompt,
    orderIndex: e.order_index,
    expected: ExpectedAnswer.parse(e.expected),
    assets:
      e.assets == null
        ? null
        : ExerciseAssets.safeParse(e.assets).data ?? null,
  }))

  return (
    <LessonPlayer
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      childId={childId}
      exercises={exercises}
    />
  )
}
