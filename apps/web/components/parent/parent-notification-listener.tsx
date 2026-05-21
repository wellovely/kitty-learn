"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/db/browser"
import type { NotificationType } from "@/lib/services/notifications"

type NotificationRow = {
  title: string
  body: string | null
  type: NotificationType
}

function showNotificationToast(row: NotificationRow) {
  const description = row.body ?? undefined
  switch (row.type) {
    case "streak_risk":
      toast.warning(row.title, { description })
      break
    case "achievement":
      toast.success(row.title, { description })
      break
    case "lesson_completed":
    case "streak":
    case "weekly_summary":
      toast.info(row.title, { description })
      break
    default:
      toast(row.title, { description })
  }
}

export function ParentNotificationListener({
  parentId,
}: {
  parentId: string
}) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`parent-notifications:${parentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `parent_id=eq.${parentId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow
          if (!row?.title) return
          showNotificationToast(row)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [parentId, router])

  return null
}
