import type { Emotion } from "./schemas"

export function pickEmotion(text: string): Emotion {
  const t = text.toLowerCase()
  if (/(wow|yay|amazing|fantastic|awesome|woohoo|incredible|brilliant)/.test(t)) {
    return "excited"
  }
  if (/(sorry|oh no|uh oh|sad|miss|cry|poor)/.test(t)) {
    return "sad"
  }
  if (/(hmm+|let me think|interesting|wonder|maybe)/.test(t)) {
    return "thinking"
  }
  if (/(huh\??|what\??|really\??|confus|don.?t (know|get))/.test(t)) {
    return "confused"
  }
  return "happy"
}
