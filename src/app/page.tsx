"use client"

import { useState, useEffect } from "react"
import EntryForm from "@/components/EntryForm"
import EntryList from "@/components/EntryList"
import { getEntries, updateEntry, JournalEntry } from "@/lib/storage"

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [query, setQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<string | null>(null)

  useEffect(() => {
    setEntries(getEntries())
  }, [])

  async function handleSaved(entry: JournalEntry) {
    setEntries((prev) => [entry, ...prev])

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.text }),
    })
    const { mood } = await res.json()

    updateEntry(entry.id, { mood })
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, mood } : e))
    )
  }

  const uniqueMoods = [...new Set(entries.map((e) => e.mood).filter(Boolean))] as string[]

  const filtered = entries
    .filter((e) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return e.text.toLowerCase().includes(q) || e.mood?.toLowerCase().includes(q)
    })
    .filter((e) => !moodFilter || e.mood === moodFilter)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">My Journal</h1>
      <EntryForm onSaved={handleSaved} />
      <div className="mt-8 flex flex-col gap-3">
        <input
          type="search"
          placeholder="Search entries or moods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {uniqueMoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodFilter(moodFilter === mood ? null : mood)}
                className={`text-xs rounded-full px-3 py-1 transition-colors ${
                  moodFilter === mood
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>
      <EntryList entries={filtered} />
    </main>
  )
}
