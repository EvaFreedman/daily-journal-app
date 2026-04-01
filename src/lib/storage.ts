export type JournalEntry = {
  id: string
  date: string
  text: string
  mood?: string
}

const KEY = "journal_entries"

export function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveEntry(text: string): JournalEntry {
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    text,
  }
  const entries = getEntries()
  localStorage.setItem(KEY, JSON.stringify([entry, ...entries]))
  return entry
}

export function updateEntry(id: string, changes: Partial<JournalEntry>): void {
  const updated = getEntries().map((e) => (e.id === id ? { ...e, ...changes } : e))
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function deleteEntry(id: string): void {
  const updated = getEntries().filter((e) => e.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}
