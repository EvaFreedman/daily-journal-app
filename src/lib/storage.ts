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

function stripEmojis(raw: string): string {
  const word = raw.replace(/[^\p{L}\s]/gu, "").trim()
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function migrateMoods(): void {
  const entries = getEntries()
  const updated = entries.map((e) => ({
    ...e,
    mood: e.mood ? stripEmojis(e.mood) : undefined,
  }))
  localStorage.setItem(KEY, JSON.stringify(updated))
}
