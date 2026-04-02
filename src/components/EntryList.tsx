"use client"

import { useState } from "react"
import { JournalEntry } from "@/lib/storage"

type Props = {
  entries: JournalEntry[]
}

const PREVIEW_LENGTH = 120

function groupByDate(entries: JournalEntry[]): Record<string, JournalEntry[]> {
  return entries.reduce<Record<string, JournalEntry[]>>((groups, entry) => {
    const day = new Date(entry.date).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!groups[day]) groups[day] = []
    groups[day].push(entry)
    return groups
  }, {})
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.text.length > PREVIEW_LENGTH
  const preview = isLong ? entry.text.slice(0, PREVIEW_LENGTH).trimEnd() + "…" : entry.text

  return (
    <div
      className="rounded-lg border border-zinc-200 p-4 cursor-pointer hover:border-zinc-300 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-400">
          {new Date(entry.date).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex items-center gap-2">
          {entry.mood && (
            <span className="text-xs bg-zinc-100 text-zinc-600 rounded-full px-2 py-0.5">
              {entry.mood}{entry.moodScore !== undefined ? ` · ${entry.moodScore}/10` : ""}
            </span>
          )}
          {isLong && (
            <span className="text-xs text-zinc-400">
              {expanded ? "collapse ↑" : "expand ↓"}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-zinc-700 whitespace-pre-wrap">
        {expanded ? entry.text : preview}
      </p>
    </div>
  )
}

export default function EntryList({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400 mt-10">No entries found.</p>
  }

  const groups = groupByDate(entries)

  return (
    <div className="mt-10 flex flex-col gap-8">
      {Object.entries(groups).map(([day, dayEntries]) => (
        <div key={day}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-2">
            {day}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {dayEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
