"use client"

import { useState } from "react"
import { saveEntry, JournalEntry } from "@/lib/storage"

type Props = {
  onSaved: (entry: JournalEntry) => void
}

export default function EntryForm({ onSaved }: Props) {
  const [text, setText] = useState("")

  function handleSave() {
    if (!text.trim()) return
    const entry = saveEntry(text.trim())
    onSaved(entry)
    setText("")
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="w-full rounded-lg border border-zinc-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400"
        rows={5}
        placeholder="What's on your mind today?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
        onClick={handleSave}
        disabled={!text.trim()}
      >
        Save entry
      </button>
    </div>
  )
}
