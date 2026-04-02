import { JournalEntry } from "@/lib/storage"

export function formatAxisDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function buildScoreByDay(entries: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>()
  for (const e of entries) {
    const day = e.date.slice(0, 10)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(e)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayEntries]) => ({
      day,
      label: formatAxisDate(day),
      avg: Math.round((dayEntries.reduce((s, e) => s + (e.moodScore ?? 0), 0) / dayEntries.length) * 10) / 10,
      entries: dayEntries,
    }))
}

export function buildDistribution(entries: JournalEntry[]) {
  const counts = Array.from({ length: 10 }, (_, i) => ({ score: i + 1, count: 0 }))
  for (const e of entries) {
    if (e.moodScore !== undefined) counts[e.moodScore - 1].count++
  }
  return counts
}

export function buildMoodFrequency(entries: JournalEntry[]) {
  const map = new Map<string, number>()
  for (const e of entries) {
    if (e.mood) map.set(e.mood, (map.get(e.mood) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([mood, count]) => ({ mood, count }))
}

export type DayPoint = ReturnType<typeof buildScoreByDay>[number]
