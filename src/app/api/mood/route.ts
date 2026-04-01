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
    max_tokens: 20,
    messages: [
      {
        role: "user",
        content: `Read this journal entry and reply with ONLY a single mood label and matching emoji (e.g. "Happy 😊" or "Reflective 🤔"). No punctuation, no explanation, just the label and emoji.\n\nEntry: ${text}`,
      },
    ],
  })

  const mood = (message.content[0] as { type: string; text: string }).text.trim()
  return NextResponse.json({ mood })
}
