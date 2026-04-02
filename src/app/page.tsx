"use client"

import { useState } from "react"
import EntryForm from "@/components/EntryForm"
import { updateEntry, JournalEntry } from "@/lib/storage"

export default function Home() {
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  async function handleSaved(entry: JournalEntry) {
    setLastSaved("Saving...")

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.text }),
    })
    const { mood } = await res.json()

    updateEntry(entry.id, { mood })
    setLastSaved(`Saved — ${mood}`)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Today</h1>
      <p className="text-sm text-zinc-400 mb-8">
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
      </p>
      <EntryForm onSaved={handleSaved} />
      {lastSaved && (
        <p className="mt-3 text-xs text-zinc-400">{lastSaved}</p>
      )}
    </main>
  )
}
