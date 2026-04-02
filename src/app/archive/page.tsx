"use client"

import { useState, useEffect } from "react"
import EntryList from "@/components/EntryList"
import Calendar from "@/components/Calendar"
import { getEntries, migrateMoods, JournalEntry } from "@/lib/storage"

export default function Archive() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [query, setQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)

  useEffect(() => {
    migrateMoods()
    setEntries(getEntries())
  }, [])

  const uniqueMoods = [...new Set(entries.map((e) => e.mood).filter(Boolean))] as string[]

  const daysWithEntries = new Set(
    entries.map((e) => e.date.slice(0, 10))
  )

  const filtered = entries
    .filter((e) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return e.text.toLowerCase().includes(q) || e.mood?.toLowerCase().includes(q)
    })
    .filter((e) => !moodFilter || e.mood === moodFilter)
    .filter((e) => !dateFilter || e.date.slice(0, 10) === dateFilter)

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">Archive</h1>

      <div className="flex gap-8 items-start">

        {/* Left sidebar: filters */}
        <aside className="flex flex-col gap-4 w-56 shrink-0 sticky top-6 self-start">
          <Calendar
            daysWithEntries={daysWithEntries}
            selected={dateFilter}
            onSelect={setDateFilter}
          />
          <input
            type="search"
            placeholder="Search entries or moods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          {uniqueMoods.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Mood</p>
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
            </div>
          )}
        </aside>

        {/* Right: entry grid */}
        <div className="flex-1 min-w-0">
          <EntryList entries={filtered} />
        </div>

      </div>
    </main>
  )
}
