import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 40,
    messages: [
      {
        role: "user",
        content: `Read this journal entry and reply with ONLY a JSON object with two fields:
- "mood": a single mood word in Title Case (e.g. "Reflective", "Anxious", "Melancholy")
- "score": a number from 1 to 10 representing emotional wellbeing (1 = very low/distressed, 10 = very high/joyful)

Reply with nothing else — no explanation, no markdown, just the raw JSON.

Entry: ${text}`,
      },
    ],
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim()

  try {
    const { mood, score } = JSON.parse(raw)
    return NextResponse.json({ mood: String(mood).trim(), score: Number(score) })
  } catch {
    return NextResponse.json({ error: "Failed to parse mood response", raw }, { status: 500 })
  }
}
