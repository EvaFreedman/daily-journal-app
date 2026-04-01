"use client"

import { useState, useEffect } from "react"
import EntryForm from "@/components/EntryForm"
import EntryList from "@/components/EntryList"
import { getEntries, JournalEntry } from "@/lib/storage"

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    setEntries(getEntries())
  }, [])

  function handleSaved(entry: JournalEntry) {
    setEntries((prev) => [entry, ...prev])
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
