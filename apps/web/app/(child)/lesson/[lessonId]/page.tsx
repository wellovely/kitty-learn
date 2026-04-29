import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getLesson } from "@/lib/services/lessons"
import { ExpectedAnswer, ExerciseAssets } from "@/lib/ai/schemas"
import { LessonPlayer } from "./_components/LessonPlayer"

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ childId?: string }>
}) {
  await requireUser()
  const { lessonId } = await params
  const { childId } = await searchParams
  if (!childId) notFound()

  const lesson = await getLesson(lessonId).catch(() => null)
  if (!lesson || lesson.exercises.length === 0) notFound()

  const exercises = lesson.exercises.map((e) => ({
    id: e.id,
    type: e.type as "phonics" | "handwriting" | "sight_word" | "vocabulary",
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
