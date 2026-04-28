"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type StartOptions = {
  onEnd?: (text: string) => void
  onError?: (code: string) => void
}

type ErrorCode =
  | "not-supported"
  | "insecure-context"
  | "not-allowed"
  | "audio-capture"
  | "network"
  | "transcribe-failed"
  | "unknown"

function pickMimeType(): string | undefined {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return undefined
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ]
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

export function useVoiceTranscription(lang = "en") {
  const [supported, setSupported] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const optsRef = useRef<StartOptions>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const ok =
      typeof MediaRecorder !== "undefined" &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia
    setSupported(ok)
  }, [])

  const fail = useCallback((code: ErrorCode, opts: StartOptions) => {
    setError(code)
    setRecording(false)
    setTranscribing(false)
    opts.onError?.(code)
  }, [])

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const transcribe = useCallback(
    async (blob: Blob, opts: StartOptions) => {
      setTranscribing(true)
      try {
        const form = new FormData()
        form.append("audio", blob, "audio.webm")
        form.append("lang", lang.slice(0, 2))
        const res = await fetch("/api/ai/transcribe", {
          method: "POST",
          body: form,
        })
        if (!res.ok) {
          const text = await res.text().catch(() => "")
          console.error("transcribe failed", res.status, text)
          fail("transcribe-failed", opts)
          return
        }
        const data = (await res.json()) as { text?: string }
        const text = (data.text ?? "").trim()
        setTranscribing(false)
        opts.onEnd?.(text)
      } catch {
        fail("network", opts)
      }
    },
    [lang, fail]
  )

  const start = useCallback(
    async (opts: StartOptions = {}) => {
      optsRef.current = opts
      setError(null)

      if (typeof window === "undefined") return
      if (!window.isSecureContext) return fail("insecure-context", opts)

      if (
        typeof MediaRecorder === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        return fail("not-supported", opts)
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        const code: ErrorCode =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "not-allowed"
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "audio-capture"
              : "unknown"
        return fail(code, opts)
      }
      streamRef.current = stream

      const mimeType = pickMimeType()
      let recorder: MediaRecorder
      try {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      } catch {
        cleanupStream()
        return fail("not-supported", opts)
      }
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onerror = () => fail("unknown", optsRef.current)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        cleanupStream()
        setRecording(false)
        if (blob.size === 0) {
          optsRef.current.onEnd?.("")
          return
        }
        void transcribe(blob, optsRef.current)
      }

      recorder.start()
      setRecording(true)
    },
    [fail, transcribe, cleanupStream]
  )

  const stop = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== "inactive") {
      rec.stop()
    }
  }, [])

  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.stop()
      } catch {
        // ignore
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { supported, recording, transcribing, error, start, stop }
}
