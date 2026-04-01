"use client"

import { useState, useEffect } from "react"
import EntryForm from "@/components/EntryForm"
import EntryList from "@/components/EntryList"
import { getEntries, updateEntry, JournalEntry } from "@/lib/storage"

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    setEntries(getEntries())
  }, [])

  async function handleSaved(entry: JournalEntry) {
    setEntries((prev) => [entry, ...prev])

    // Ask our API route to tag the mood — this runs after the entry is already visible
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.text }),
    })
    const { mood } = await res.json()

    // Save mood to localStorage and update the displayed entry
    updateEntry(entry.id, { mood })
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, mood } : e))
    )
  }

  const filtered = query.trim()
    ? entries.filter((e) => e.text.toLowerCase().includes(query.toLowerCase()))
    : entries

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">My Journal</h1>
      <EntryForm onSaved={handleSaved} />
      <div className="mt-8">
        <input
          type="search"
          placeholder="Search entries..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>
      <EntryList entries={filtered} />
    </main>
  )
}
