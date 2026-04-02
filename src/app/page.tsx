"use client"

import { useState, useRef } from "react"
import EntryForm from "@/components/EntryForm"
import Calendar from "@/components/Calendar"
import { updateEntry, JournalEntry } from "@/lib/storage"

function toYMD(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

export default function Home() {
  const today = new Date()
  const [entryDate, setEntryDate] = useState<Date>(today)
  const [showCalendar, setShowCalendar] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Close calendar when mouse leaves the whole date+calendar area
  function handleMouseLeave(e: React.MouseEvent) {
    if (calendarRef.current && !calendarRef.current.contains(e.relatedTarget as Node)) {
      setShowCalendar(false)
    }
  }

  function handleDateSelect(ymd: string | null) {
    if (!ymd) return
    const [y, m, d] = ymd.split("-").map(Number)
    setEntryDate(new Date(y, m - 1, d))
    setShowCalendar(false)
  }

  async function handleSaved(entry: JournalEntry) {
    setLastSaved("Saving...")

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: entry.text }),
    })
    const data = await res.json()

    if (res.ok) {
      updateEntry(entry.id, { mood: data.mood, moodScore: data.score })
      setLastSaved(`Saved — ${data.mood} (${data.score}/10)`)
    } else {
      setLastSaved("Saved — mood tagging failed")
    }
  }

  const isToday = toYMD(entryDate) === toYMD(today)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">

      {/* Date header with picker */}
      <div className="relative mb-8" ref={calendarRef} onMouseLeave={handleMouseLeave}>
        <h1 className="text-2xl font-bold mb-1">
          {isToday ? "Today" : formatDate(entryDate)}
        </h1>
        <div className="flex items-center gap-3">
          {isToday && (
            <p className="text-sm text-zinc-400">{formatDate(today)}</p>
          )}
          <button
            onMouseEnter={() => setShowCalendar(true)}
            className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2"
          >
            {isToday ? "Write for a different date" : "Change date"}
          </button>
          {!isToday && (
            <button
              onClick={() => { setEntryDate(today); setShowCalendar(false) }}
              className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2"
            >
              Back to today
            </button>
          )}
        </div>

        {showCalendar && (
          <div className="absolute top-full right-0 mt-1 z-10 bg-white rounded-lg shadow-lg border border-zinc-200">
            <Calendar
              daysWithEntries={new Set()}
              selected={toYMD(entryDate)}
              onSelect={handleDateSelect}
              allDaysSelectable
            />
          </div>
        )}
      </div>

      <EntryForm onSaved={handleSaved} date={entryDate} />

      {lastSaved && (
        <p className="mt-3 text-xs text-zinc-400">{lastSaved}</p>
      )}

    </main>
  )
}
