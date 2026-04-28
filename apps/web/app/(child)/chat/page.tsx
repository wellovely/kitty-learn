import { notFound } from "next/navigation"
import { requireParentOfChild } from "@/lib/auth/session"
import { KittenChat } from "./_components/KittenChat"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>
}) {
  const { childId } = await searchParams
  if (!childId) notFound()

  const child = await requireParentOfChild(childId)

  return (
    <KittenChat childId={child.id} childName={child.name} />
  )
}
