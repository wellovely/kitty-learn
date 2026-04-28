"use client"

import { Loader2, Mic, MicOff, Square } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { useVoiceTranscription } from "@/hooks/useVoiceTranscription"
import { useSound } from "@/hooks/useSound"

type Props = {
  onTranscript: (text: string) => void
}

export function VoiceButton({ onTranscript }: Props) {
  const vt = useVoiceTranscription("en")
  const { play } = useSound()

  if (!vt.supported) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Button variant="outline" size="icon-lg" disabled className="rounded-full">
          <MicOff />
        </Button>
        <span className="text-[10px] text-muted-foreground">N/A</span>
      </div>
    )
  }

  function handle() {
    if (vt.recording) {
      play("pop")
      vt.stop()
      return
    }
    if (vt.transcribing) return
    play("pop")
    void vt.start({
      onEnd: (text) => {
        if (text) onTranscript(text)
        else toast("Didn't catch that — try again 🐾")
      },
      onError: (code) => {
        if (code === "not-allowed") {
          toast.error("Microphone is blocked", {
            description: "Click the lock icon → Site settings → Microphone → Allow.",
          })
        } else if (code === "audio-capture") {
          toast.error("No microphone found")
        } else if (code === "insecure-context") {
          toast.error("Voice needs HTTPS or localhost")
        } else if (code === "not-supported") {
          toast.error("Voice not supported in this browser")
        } else if (code === "transcribe-failed") {
          toast.error("Transcription failed", {
            description: "Check the DEEPGRAM_API_KEY on the server.",
          })
        } else if (code === "network") {
          toast.error("Network error — check your connection")
        } else {
          toast.error(`Voice error: ${code}`)
        }
      },
    })
  }

  const label = vt.recording ? "Listening…" : vt.transcribing ? "Transcribing…" : "Speak"

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        {vt.recording && (
          <motion.span
            className="absolute inset-0 rounded-full bg-rose-400/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        )}
        <Button
          type="button"
          size="icon-lg"
          variant={vt.recording ? "destructive" : "default"}
          onClick={handle}
          disabled={vt.transcribing}
          aria-label={vt.recording ? "Stop recording" : "Tap to speak"}
          className="relative rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 data-[variant=destructive]:bg-rose-600"
        >
          {vt.recording ? <Square /> : vt.transcribing ? <Loader2 className="animate-spin" /> : <Mic />}
        </Button>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300">
        {label}
      </span>
    </div>
  )
}
