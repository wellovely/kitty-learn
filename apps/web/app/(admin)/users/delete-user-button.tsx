"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { GameButton } from "@workspace/ui/components/game-button"
import { deleteUserAccount } from "./actions"

export function DeleteUserButton({
  userId,
  displayName,
}: {
  userId: string
  displayName: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <GameButton
      type="button"
      color="red"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete user ${displayName}? This cannot be undone.`)) return
        startTransition(async () => {
          try {
            await deleteUserAccount(userId)
            toast.success("User deleted")
            router.refresh()
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed")
          }
        })
      }}
    >
      Delete
    </GameButton>
  )
}
