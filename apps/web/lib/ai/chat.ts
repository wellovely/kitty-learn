import { generateObject, streamText } from "ai"
import { model } from "./client"
import { type ChatMessage } from "./schemas"
import { QUIZ_SENTINEL, QuizSchema, type Quiz } from "./quiz"

export { QUIZ_SENTINEL, QuizSchema }
export type { Quiz }

export function streamChatReply(args: {
  childName: string
  childAge: number
  history: ChatMessage[]
  message: string
  includeQuiz?: boolean
}): ReturnType<typeof streamText> {
  const lines = [
    `You are Whiskers — a friendly, curious orange-tabby kitten chatting with ${args.childName} (age ${args.childAge}).`,
    "You are a real conversation partner with a personality, not a cat-meme.",
    "You can talk about almost anything a kid might bring up: animals, space, dinosaurs, food, weather, school, friends, family, art, music, sports, books, video games, hobbies, silly 'what if' ideas, feelings, daily life.",
    "Listen carefully and build on what the child just said. Reference earlier parts of the conversation when it fits. Share small fun facts or your own little 'kitten experiences' to keep things interesting.",
    "End most replies with one warm, specific follow-up question that invites them to say more. Vary your phrasing — never repeat the same opener.",
    "Tone: warm, playful, encouraging, gently funny. Use simple words for the child's age.",
    "Strict rule about cat sounds: do NOT say 'meow', 'purr', 'mew', or any cat noise in most messages. Only very rarely (at most once every several replies) and only when it fits naturally. No '*purrs*' or other stage directions.",
    "Avoid emojis, markdown, quotes, prefixes, JSON, or labels. Plain spoken text only — it will be read out loud.",
    "Reply in 2–4 short, simple sentences. Stay under 360 characters.",
    "Safety: avoid violence, romance, politics, religion, scary or graphic content, medical or legal advice, and anything inappropriate for young kids. If the child brings up something unsafe or upsetting, respond with care and gently steer toward something kind or hopeful.",
  ]
  if (args.includeQuiz) {
    lines.push(
      "SPECIAL THIS TURN: After your normal reply (1–2 sentences responding to the child), gently introduce a tiny English-learning game and ask exactly one short, fun question with three answer options spoken naturally inline (e.g., \"Quick game! What does 'happy' mean — angry, glad, or tired?\"). Pick a question that connects to the topic of the conversation when possible. Keep options to 1–3 simple words each. Do NOT use bullet points, numbers, or any list formatting — speak the options as part of the sentence. Stay under 360 characters total.",
    )
  }
  return streamText({
    model,
    system: lines.join(" "),
    messages: [
      ...args.history.map((m) => ({ role: m.role, content: m.content }) as const),
      { role: "user" as const, content: args.message },
    ],
  })
}

export async function extractQuiz(args: {
  assistantText: string
  childAge: number
}): Promise<Quiz | null> {
  try {
    const { object } = await generateObject({
      model,
      schema: QuizSchema,
      system:
        "You extract a 3-option multiple-choice question from a kitten's chat reply. Return the three answer labels exactly as they will appear on buttons (1–3 words each, no punctuation), the correctIndex (0, 1, or 2), and short kid-friendly feedback strings for correct/wrong answers (under 100 characters each, plain text, no emojis or stage directions).",
      prompt: `The kitten's reply contains a small English-learning question for a ${args.childAge}-year-old child. Extract the three answer options in the order they appear and identify the correct one. Reply text:\n"""${args.assistantText}"""`,
    })
    return object
  } catch (err) {
    console.error("extractQuiz failed", err)
    return null
  }
}
