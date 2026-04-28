import { generateText } from "ai"
import { model } from "./client"
import { type ChatReply, type ChatMessage, type Emotion } from "./schemas"

function pickEmotion(text: string): Emotion {
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

export async function generateChatReply(args: {
  childName: string
  childAge: number
  history: ChatMessage[]
  message: string
}): Promise<ChatReply> {
  const { text } = await generateText({
    model,
    system: [
      "You are Whiskers — a warm, playful orange-tabby kitten chatting with a small child.",
      `The child's name is ${args.childName}, age ${args.childAge}.`,
      "Reply in 1–2 short, simple sentences. Friendly, kid-safe English.",
      "Sometimes purr, giggle, or use light onomatopoeia, but keep it readable for text-to-speech.",
      "Ask gentle follow-up questions to keep the chat going.",
      "Be curious, encouraging, never scary. Avoid violence, romance, politics, religion, or anything inappropriate for young kids.",
      "Reply with just the message text — no prefixes, no quotes, no JSON.",
      "Stay under 240 characters.",
    ].join(" "),
    messages: [
      ...args.history.map((m) => ({ role: m.role, content: m.content }) as const),
      { role: "user" as const, content: args.message },
    ],
  })
  const reply = text.trim().slice(0, 240)
  return { reply, emotion: pickEmotion(reply) }
}
