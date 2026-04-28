/**
 * Sound manager for child UI.
 *
 * Uses Web Audio API to synthesize short game-y effects (no mp3 files
 * to ship). Howler is installed too — if you later drop files into
 * `public/sounds/*.mp3`, swap `play()` to use `new Howl({ src: ... })`.
 */

type SoundName =
  | "click"
  | "correct"
  | "wrong"
  | "complete"
  | "star"
  | "pop"
  | "unlock"

const STORAGE_KEY = "kitty:sound"

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true
  private listeners = new Set<(enabled: boolean) => void>()

  constructor() {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "0") this.enabled = false
    }
  }

  isEnabled() {
    return this.enabled
  }

  subscribe(fn: (enabled: boolean) => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  setEnabled(v: boolean) {
    this.enabled = v
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0")
    }
    this.listeners.forEach((fn) => fn(v))
  }

  toggle() {
    this.setEnabled(!this.enabled)
    return this.enabled
  }

  private ensureCtx() {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
    }
    if (this.ctx.state === "suspended") void this.ctx.resume()
    return this.ctx
  }

  private tone(
    freq: number,
    durationMs: number,
    opts: {
      type?: OscillatorType
      volume?: number
      attack?: number
      release?: number
      delay?: number
    } = {}
  ) {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const t0 = ctx.currentTime + (opts.delay ?? 0)
    const attack = opts.attack ?? 0.005
    const release = opts.release ?? 0.05
    const dur = durationMs / 1000
    const vol = opts.volume ?? 0.2

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = opts.type ?? "sine"
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + attack)
    gain.gain.setValueAtTime(vol, t0 + dur)
    gain.gain.linearRampToValueAtTime(0, t0 + dur + release)

    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + release + 0.01)
  }

  private slide(
    fromHz: number,
    toHz: number,
    durationMs: number,
    volume = 0.18
  ) {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const t0 = ctx.currentTime
    const dur = durationMs / 1000
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(fromHz, t0)
    osc.frequency.exponentialRampToValueAtTime(Math.max(toHz, 1), t0 + dur)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
    gain.gain.linearRampToValueAtTime(0, t0 + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.02)
  }

  play(name: SoundName) {
    if (!this.enabled) return
    switch (name) {
      case "click":
        this.tone(660, 40, { type: "triangle", volume: 0.12 })
        return
      case "pop":
        this.slide(300, 900, 90, 0.16)
        return
      case "correct":
        // C5 → E5 → G5
        this.tone(523.25, 90, { type: "triangle", volume: 0.18 })
        this.tone(659.25, 90, { type: "triangle", volume: 0.18, delay: 0.09 })
        this.tone(783.99, 140, { type: "triangle", volume: 0.2, delay: 0.18 })
        return
      case "wrong":
        this.tone(220, 120, { type: "sawtooth", volume: 0.12 })
        this.tone(185, 160, { type: "sawtooth", volume: 0.12, delay: 0.1 })
        return
      case "star":
        this.tone(988, 60, { type: "sine", volume: 0.15 })
        this.tone(1319, 90, { type: "sine", volume: 0.15, delay: 0.06 })
        return
      case "complete":
        // Fanfare C-E-G-C
        this.tone(523.25, 110, { type: "triangle", volume: 0.2 })
        this.tone(659.25, 110, { type: "triangle", volume: 0.2, delay: 0.11 })
        this.tone(783.99, 110, { type: "triangle", volume: 0.2, delay: 0.22 })
        this.tone(1046.5, 260, { type: "triangle", volume: 0.24, delay: 0.33 })
        return
      case "unlock":
        this.slide(400, 1100, 180, 0.18)
        return
    }
  }
}

let instance: SoundManager | null = null

export function getSoundManager(): SoundManager {
  if (!instance) instance = new SoundManager()
  return instance
}
