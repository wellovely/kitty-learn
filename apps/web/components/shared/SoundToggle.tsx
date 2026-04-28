"use client"

import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useSound } from "@/hooks/useSound"

export function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={enabled ? "Mute sound" : "Unmute sound"}
      onClick={toggle}
    >
      {enabled ? <Volume2 /> : <VolumeX />}
    </Button>
  )
}
