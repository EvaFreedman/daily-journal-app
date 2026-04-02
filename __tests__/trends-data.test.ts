import { describe, it, expect } from 'vitest'
import { buildScoreByDay, buildDistribution, buildMoodFrequency } from '@/lib/trends'
import type { JournalEntry } from '@/lib/storage'

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: crypto.randomUUID(),
    date: '2026-04-01T12:00:00.000Z',
    text: 'Test entry',
    ...overrides,
  }
}

// ── buildScoreByDay ───────────────────────────────────────────────────────────

describe('buildScoreByDay', () => {
  it('groups entries by date', () => {
    const entries = [
      makeEntry({ date: '2026-04-01T12:00:00.000Z', moodScore: 7 }),
      makeEntry({ date: '2026-04-01T18:00:00.000Z', moodScore: 5 }),
      makeEntry({ date: '2026-04-02T12:00:00.000Z', moodScore: 8 }),
    ]
    const result = buildScoreByDay(entries)
    expect(result.length).toBe(2)
    expect(result[0].day).toBe('2026-04-01')
    expect(result[1].day).toBe('2026-04-02')
  })

  it('calculates the average score per day', () => {
    const entries = [
      makeEntry({ date: '2026-04-01T12:00:00.000Z', moodScore: 6 }),
      makeEntry({ date: '2026-04-01T18:00:00.000Z', moodScore: 8 }),
    ]
    const result = buildScoreByDay(entries)
    expect(result[0].avg).toBe(7)
  })

  it('rounds the average to one decimal place', () => {
    const entries = [
      makeEntry({ date: '2026-04-01T12:00:00.000Z', moodScore: 7 }),
      makeEntry({ date: '2026-04-01T18:00:00.000Z', moodScore: 8 }),
      makeEntry({ date: '2026-04-01T20:00:00.000Z', moodScore: 6 }),
    ]
    const result = buildScoreByDay(entries)
    expect(result[0].avg).toBe(7)
  })

  it('sorts days in chronological order', () => {
    const entries = [
      makeEntry({ date: '2026-04-03T12:00:00.000Z', moodScore: 5 }),
      makeEntry({ date: '2026-04-01T12:00:00.000Z', moodScore: 7 }),
      makeEntry({ date: '2026-04-02T12:00:00.000Z', moodScore: 9 }),
    ]
    const result = buildScoreByDay(entries)
    expect(result.map(r => r.day)).toEqual(['2026-04-01', '2026-04-02', '2026-04-03'])
  })

  it('includes all entries for the day', () => {
    const e1 = makeEntry({ date: '2026-04-01T09:00:00.000Z', moodScore: 4, text: 'Morning' })
    const e2 = makeEntry({ date: '2026-04-01T21:00:00.000Z', moodScore: 8, text: 'Evening' })
    const result = buildScoreByDay([e1, e2])
    expect(result[0].entries.length).toBe(2)
  })

  it('handles a single entry per day', () => {
    const entries = [makeEntry({ date: '2026-04-01T12:00:00.000Z', moodScore: 9 })]
    const result = buildScoreByDay(entries)
    expect(result[0].avg).toBe(9)
  })
})

// ── buildDistribution ─────────────────────────────────────────────────────────

describe('buildDistribution', () => {
  it('returns 10 buckets covering scores 1–10', () => {
    const result = buildDistribution([])
    expect(result.length).toBe(10)
    expect(result.map(r => r.score)).toEqual([1,2,3,4,5,6,7,8,9,10])
  })

  it('starts with all counts at zero', () => {
    const result = buildDistribution([])
    result.forEach(r => expect(r.count).toBe(0))
  })

  it('increments the correct bucket for each entry', () => {
    const entries = [
      makeEntry({ moodScore: 7 }),
      makeEntry({ moodScore: 7 }),
      makeEntry({ moodScore: 3 }),
    ]
    const result = buildDistribution(entries)
    expect(result[6].count).toBe(2) // score 7 is index 6
    expect(result[2].count).toBe(1) // score 3 is index 2
  })

  it('ignores entries without a moodScore', () => {
    const entries = [
      makeEntry({ moodScore: undefined }),
      makeEntry({ moodScore: 5 }),
    ]
    const result = buildDistribution(entries)
    expect(result[4].count).toBe(1)
    const total = result.reduce((s, r) => s + r.count, 0)
    expect(total).toBe(1)
  })

  it('counts all entries across all scores', () => {
    const entries = [1,2,3,4,5,6,7,8,9,10].map(s => makeEntry({ moodScore: s }))
    const result = buildDistribution(entries)
    const total = result.reduce((s, r) => s + r.count, 0)
    expect(total).toBe(10)
    result.forEach(r => expect(r.count).toBe(1))
  })
})

// ── buildMoodFrequency ────────────────────────────────────────────────────────

describe('buildMoodFrequency', () => {
  it('counts occurrences of each mood word', () => {
    const entries = [
      makeEntry({ mood: 'Happy' }),
      makeEntry({ mood: 'Happy' }),
      makeEntry({ mood: 'Calm' }),
    ]
    const result = buildMoodFrequency(entries)
    expect(result.find(r => r.mood === 'Happy')?.count).toBe(2)
    expect(result.find(r => r.mood === 'Calm')?.count).toBe(1)
  })

  it('sorts by frequency descending', () => {
    const entries = [
      makeEntry({ mood: 'Calm' }),
      makeEntry({ mood: 'Happy' }),
      makeEntry({ mood: 'Happy' }),
      makeEntry({ mood: 'Anxious' }),
      makeEntry({ mood: 'Anxious' }),
      makeEntry({ mood: 'Anxious' }),
    ]
    const result = buildMoodFrequency(entries)
    expect(result[0].mood).toBe('Anxious')
    expect(result[1].mood).toBe('Happy')
    expect(result[2].mood).toBe('Calm')
  })

  it('ignores entries without a mood', () => {
    const entries = [
      makeEntry({ mood: undefined }),
      makeEntry({ mood: 'Reflective' }),
    ]
    const result = buildMoodFrequency(entries)
    expect(result.length).toBe(1)
    expect(result[0].mood).toBe('Reflective')
  })

  it('returns an empty array when no entries have moods', () => {
    const entries = [makeEntry({ mood: undefined }), makeEntry({ mood: undefined })]
    expect(buildMoodFrequency(entries)).toEqual([])
  })
})
