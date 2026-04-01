"use client"

import { JournalEntry } from "@/lib/storage"

type Props = {
  entries: JournalEntry[]
}

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

export default function EntryList({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400 mt-10">No entries yet. Write your first one above.</p>
  }

  const groups = groupByDate(entries)

  return (
    <div className="mt-10 flex flex-col gap-8">
      {Object.entries(groups).map(([day, dayEntries]) => (
        <div key={day}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-100 pb-2">
            {day}
          </h2>
          <div className="flex flex-col gap-3">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-400 mb-2">
                  {new Date(entry.date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
