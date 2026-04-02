import { describe, it, expect, beforeEach } from 'vitest'
import { saveEntry, updateEntry, getEntries } from '@/lib/storage'
import type { JournalEntry } from '@/lib/storage'

// These tests cover the filtering logic used on the archive page,
// without needing to render the full React component.

beforeEach(() => {
  localStorage.clear()
})

function applyFilters(
  entries: JournalEntry[],
  query: string,
  moodFilter: string | null,
  dateFilter: string | null
): JournalEntry[] {
  return entries
    .filter((e) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return e.text.toLowerCase().includes(q) || e.mood?.toLowerCase().includes(q)
    })
    .filter((e) => !moodFilter || e.mood === moodFilter)
    .filter((e) => !dateFilter || e.date.slice(0, 10) === dateFilter)
}

describe('Archive search filter', () => {
  it('returns all entries when query is empty', () => {
    saveEntry('Morning walk')
    saveEntry('Evening thoughts')
    const result = applyFilters(getEntries(), '', null, null)
    expect(result.length).toBe(2)
  })

  it('filters entries by keyword in text', () => {
    saveEntry('Morning walk in the park')
    saveEntry('Evening thoughts')
    const result = applyFilters(getEntries(), 'park', null, null)
    expect(result.length).toBe(1)
    expect(result[0].text).toBe('Morning walk in the park')
  })

  it('is case-insensitive', () => {
    saveEntry('Feeling Grateful today')
    const result = applyFilters(getEntries(), 'grateful', null, null)
    expect(result.length).toBe(1)
  })

  it('filters by mood text via search query', () => {
    const a = saveEntry('Had a good day')
    const b = saveEntry('Feeling low')
    updateEntry(a.id, { mood: 'Happy' })
    updateEntry(b.id, { mood: 'Sad' })
    const result = applyFilters(getEntries(), 'happy', null, null)
    expect(result.length).toBe(1)
    expect(result[0].mood).toBe('Happy')
  })

  it('returns no results when query matches nothing', () => {
    saveEntry('Morning walk')
    const result = applyFilters(getEntries(), 'xyz123', null, null)
    expect(result.length).toBe(0)
  })
})

describe('Archive mood filter', () => {
  it('filters entries by exact mood', () => {
    const a = saveEntry('Good day')
    const b = saveEntry('Bad day')
    const c = saveEntry('Okay day')
    updateEntry(a.id, { mood: 'Happy' })
    updateEntry(b.id, { mood: 'Sad' })
    updateEntry(c.id, { mood: 'Neutral' })
    const result = applyFilters(getEntries(), '', 'Happy', null)
    expect(result.length).toBe(1)
    expect(result[0].mood).toBe('Happy')
  })

  it('returns no results when no entries match the mood filter', () => {
    const entry = saveEntry('Some entry')
    updateEntry(entry.id, { mood: 'Calm' })
    const result = applyFilters(getEntries(), '', 'Excited', null)
    expect(result.length).toBe(0)
  })

  it('returns all entries when mood filter is null', () => {
    const a = saveEntry('Entry A')
    const b = saveEntry('Entry B')
    updateEntry(a.id, { mood: 'Happy' })
    updateEntry(b.id, { mood: 'Sad' })
    const result = applyFilters(getEntries(), '', null, null)
    expect(result.length).toBe(2)
  })
})

describe('Archive date filter', () => {
  it('filters entries to a specific date', () => {
    const past = new Date('2025-06-10T12:00:00Z')
    const today = new Date()
    saveEntry('Past entry', past)
    saveEntry('Today entry', today)
    const result = applyFilters(getEntries(), '', null, '2025-06-10')
    expect(result.length).toBe(1)
    expect(result[0].text).toBe('Past entry')
  })

  it('returns all entries when date filter is null', () => {
    saveEntry('Entry A', new Date(2025, 0, 1))
    saveEntry('Entry B', new Date(2025, 6, 15))
    const result = applyFilters(getEntries(), '', null, null)
    expect(result.length).toBe(2)
  })

  it('returns no results when no entries exist for that date', () => {
    saveEntry('Some entry', new Date(2025, 0, 1))
    const result = applyFilters(getEntries(), '', null, '2024-01-01')
    expect(result.length).toBe(0)
  })
})

describe('Combined filters', () => {
  it('applies search and mood filter together', () => {
    const a = saveEntry('Happy morning walk')
    const b = saveEntry('Happy evening rest')
    const c = saveEntry('Sad morning')
    updateEntry(a.id, { mood: 'Happy' })
    updateEntry(b.id, { mood: 'Happy' })
    updateEntry(c.id, { mood: 'Sad' })
    const result = applyFilters(getEntries(), 'morning', 'Happy', null)
    expect(result.length).toBe(1)
    expect(result[0].text).toBe('Happy morning walk')
  })

  it('applies search and date filter together', () => {
    const past = new Date('2025-06-10T12:00:00Z')
    const today = new Date()
    saveEntry('Park walk today', today)
    saveEntry('Park walk in past', past)
    saveEntry('Other entry today', today)
    const todayYMD = today.toISOString().slice(0, 10)
    const result = applyFilters(getEntries(), 'park', null, todayYMD)
    expect(result.length).toBe(1)
    expect(result[0].text).toBe('Park walk today')
  })

  it('applies all three filters together', () => {
    const past = new Date('2025-06-10T12:00:00Z')
    const a = saveEntry('Calm morning', past)
    const b = saveEntry('Calm evening', past)
    const c = saveEntry('Anxious morning', past)
    updateEntry(a.id, { mood: 'Calm' })
    updateEntry(b.id, { mood: 'Calm' })
    updateEntry(c.id, { mood: 'Anxious' })
    const result = applyFilters(getEntries(), 'morning', 'Calm', '2025-06-10')
    expect(result.length).toBe(1)
    expect(result[0].text).toBe('Calm morning')
  })
})
