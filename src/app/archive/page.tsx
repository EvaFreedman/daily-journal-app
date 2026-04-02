"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import EntryList from "@/components/EntryList"
import Calendar from "@/components/Calendar"
import { getEntries, migrateMoods, JournalEntry } from "@/lib/storage"

function ArchiveInner() {
  const searchParams = useSearchParams()

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [query, setQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<string | null>(searchParams.get("mood"))
  const [dateFilter, setDateFilter] = useState<string | null>(searchParams.get("date"))
  const [minScore, setMinScore] = useState(Number(searchParams.get("minScore") ?? 1))
  const [exactScore, setExactScore] = useState<number | null>(searchParams.get("exactScore") ? Number(searchParams.get("exactScore")) : null)

  useEffect(() => {
    migrateMoods()
    setEntries(getEntries())
  }, [])

  const uniqueMoods = [...new Set(entries.map((e) => e.mood).filter(Boolean))] as string[]
  const hasAnyScore = entries.some((e) => e.moodScore !== undefined)

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
    .filter((e) => e.moodScore === undefined || e.moodScore >= minScore)
    .filter((e) => exactScore === null || e.moodScore === exactScore)

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
          {hasAnyScore && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Min score</p>
                <span className="text-xs font-semibold text-zinc-700">{minScore}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-zinc-900"
              />
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Low</span>
                <span>High</span>
              </div>
              {minScore > 1 && (
                <button
                  onClick={() => setMinScore(1)}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 text-left"
                >
                  Clear score filter
                </button>
              )}
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

export default function Archive() {
  return (
    <Suspense>
      <ArchiveInner />
    </Suspense>
  )
}
