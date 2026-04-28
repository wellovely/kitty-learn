"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
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
    <Button variant="ghost" size="sm" onClick={handle} disabled={pending}>
      {pending ? "..." : "Sign out"}
    </Button>
  )
}
