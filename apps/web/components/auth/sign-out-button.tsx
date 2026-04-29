"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GameButton } from "@workspace/ui/components/game-button"
import { createClient } from "@/lib/db/browser"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  async function handle() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }
  return (
    <GameButton color="neutral" size="sm" onClick={handle} disabled={pending}>
      {pending ? "..." : "Sign out"}
    </GameButton>
  )
}
