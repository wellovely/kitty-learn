import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Kitty Learn",
  },
})

export const model: LanguageModel = openrouter.chat("x-ai/grok-4.1-fast")
