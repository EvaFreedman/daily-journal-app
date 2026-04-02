import { describe, it, expect, beforeEach } from 'vitest'
import { saveEntry, getEntries, updateEntry, migrateMoods } from '@/lib/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('saveEntry', () => {
  it('saves an entry and returns it', () => {
    const entry = saveEntry('Hello world')
    expect(entry.text).toBe('Hello world')
    expect(entry.id).toBeTruthy()
    expect(entry.date).toBeTruthy()
  })

  it('persists entries to localStorage', () => {
    saveEntry('First entry')
    saveEntry('Second entry')
    const entries = getEntries()
    expect(entries.length).toBe(2)
  })

  it('stores newest entry first', () => {
    saveEntry('First')
    saveEntry('Second')
    const entries = getEntries()
    expect(entries[0].text).toBe('Second')
    expect(entries[1].text).toBe('First')
  })

  it('saves entry with a custom date', () => {
    const pastDate = new Date('2025-01-15T12:00:00Z')
    const entry = saveEntry('Past entry', pastDate)
    expect(entry.date).toBe(pastDate.toISOString())
    const stored = getEntries().find(e => e.id === entry.id)
    expect(stored?.date).toBe(pastDate.toISOString())
  })

  it('defaults to today when no date is provided', () => {
    const before = Date.now()
    const entry = saveEntry('Today entry')
    const after = Date.now()
    const entryTime = new Date(entry.date).getTime()
    expect(entryTime).toBeGreaterThanOrEqual(before)
    expect(entryTime).toBeLessThanOrEqual(after)
  })
})

describe('updateEntry', () => {
  it('updates a field on an existing entry', () => {
    const entry = saveEntry('Some text')
    updateEntry(entry.id, { mood: 'Happy' })
    const updated = getEntries().find(e => e.id === entry.id)
    expect(updated?.mood).toBe('Happy')
  })

  it('does not affect other entries', () => {
    const a = saveEntry('Entry A')
    const b = saveEntry('Entry B')
    updateEntry(a.id, { mood: 'Calm' })
    const bStored = getEntries().find(e => e.id === b.id)
    expect(bStored?.mood).toBeUndefined()
  })
})

describe('migrateMoods', () => {
  it('strips emojis from mood tags', () => {
    const entry = saveEntry('Test')
    updateEntry(entry.id, { mood: 'Happy 😊' })
    migrateMoods()
    const migrated = getEntries().find(e => e.id === entry.id)
    expect(migrated?.mood).toBe('Happy')
  })

  it('normalises capitalisation to Title Case', () => {
    const entry = saveEntry('Test')
    updateEntry(entry.id, { mood: 'peaceful 🕊️' })
    migrateMoods()
    const migrated = getEntries().find(e => e.id === entry.id)
    expect(migrated?.mood).toBe('Peaceful')
  })

  it('leaves entries without moods untouched', () => {
    const entry = saveEntry('No mood entry')
    migrateMoods()
    const stored = getEntries().find(e => e.id === entry.id)
    expect(stored?.mood).toBeUndefined()
  })

  it('is safe to run multiple times (idempotent)', () => {
    const entry = saveEntry('Test')
    updateEntry(entry.id, { mood: 'Reflective 🤔' })
    migrateMoods()
    migrateMoods()
    const migrated = getEntries().find(e => e.id === entry.id)
    expect(migrated?.mood).toBe('Reflective')
  })
})
