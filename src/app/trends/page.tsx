"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer, Cell,
} from "recharts"
import { getEntries, JournalEntry } from "@/lib/storage"
import { buildScoreByDay, buildDistribution, buildMoodFrequency, formatAxisDate, DayPoint } from "@/lib/trends"

// ── Custom tooltips ───────────────────────────────────────────────────────────

function ScoreTooltip({ active, payload }: { active?: boolean; payload?: { payload: DayPoint }[] }) {
  if (!active || !payload?.length) return null
  const { day, avg } = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow px-2 py-1 text-xs">
      <p className="font-semibold text-zinc-700">{formatAxisDate(day)} · {avg}/10</p>
    </div>
  )
}

function DistributionTooltip({ active, payload }: { active?: boolean; payload?: { payload: { score: number; count: number } }[] }) {
  if (!active || !payload?.length) return null
  const { score, count } = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-zinc-700">{count} {count === 1 ? "entry" : "entries"} scored {score}/10</p>
      <p className="text-zinc-400 mt-1 italic">Click to see these entries</p>
    </div>
  )
}

function MoodTooltip({ active, payload }: { active?: boolean; payload?: { payload: { mood: string; count: number } }[] }) {
  if (!active || !payload?.length) return null
  const { mood, count } = payload[0].payload
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-zinc-700">{mood}</p>
      <p className="text-zinc-500">{count} {count === 1 ? "entry" : "entries"}</p>
      <p className="text-zinc-400 mt-1 italic">Click to filter archive</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Trends() {
  const router = useRouter()
  const [scoredEntries, setScoredEntries] = useState<JournalEntry[]>([])
  const [hoveredDay, setHoveredDay] = useState<DayPoint | null>(null)

  useEffect(() => {
    setScoredEntries(getEntries().filter((e) => e.moodScore !== undefined))
  }, [])

  if (scoredEntries.length < 2) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Trends</h1>
        <p className="text-sm text-zinc-400">Write a few more entries to see your mood trends here.</p>
      </main>
    )
  }

  const scoreByDay = buildScoreByDay(scoredEntries)
  const distribution = buildDistribution(scoredEntries)
  const moodFrequency = buildMoodFrequency(scoredEntries)

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Trends</h1>
      <p className="text-xs text-zinc-400 mb-10">Hover a point to preview entries · click to open in archive</p>

      {/* Chart 1: Score over time */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Mood score over time</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={scoreByDay}
            onMouseMove={(d) => {
              const data = d as { activePayload?: { payload: DayPoint }[] }
              if (data?.activePayload?.length) setHoveredDay(data.activePayload[0].payload)
            }}
            onMouseLeave={() => setHoveredDay(null)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <YAxis domain={[1, 10]} ticks={[1,2,3,4,5,6,7,8,9,10]} interval={0} tick={{ fontSize: 11, fill: "#a1a1aa" }} width={24} />
            <Tooltip content={<ScoreTooltip />} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#18181b"
              strokeWidth={2}
              dot={{ r: 4, fill: "#18181b", cursor: "pointer" }}
              activeDot={{ r: 6, cursor: "pointer", onClick: (_: unknown, payload: { payload: DayPoint }) => router.push(`/archive?date=${payload.payload.day}`) }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Entry preview panel — shown below the chart on hover */}
        <div className="mt-3 min-h-[48px]">
          {hoveredDay ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-700 mb-1">
                {formatAxisDate(hoveredDay.day)} · {hoveredDay.avg}/10
                <span className="ml-2 font-normal text-zinc-400 italic">click dot to open in archive</span>
              </p>
              {hoveredDay.entries.map((e) => (
                <p key={e.id} className="mt-1 leading-snug text-zinc-500">
                  {e.text.slice(0, 120)}{e.text.length > 120 ? "…" : ""}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Chart 2: Score distribution */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Score distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="score" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} width={24} />
            <Tooltip content={<DistributionTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data: { score: number }) => router.push(`/archive?exactScore=${data.score}`)}>
              {distribution.map((entry) => (
                <Cell key={entry.score} fill={entry.count > 0 ? "#18181b" : "#e4e4e7"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Chart 3: Mood word frequency */}
      {moodFrequency.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Mood frequency</h2>
          <ResponsiveContainer width="100%" height={Math.max(160, moodFrequency.length * 36)}>
            <BarChart data={moodFrequency} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
              <YAxis type="category" dataKey="mood" tick={{ fontSize: 11, fill: "#a1a1aa" }} width={80} />
              <Tooltip content={<MoodTooltip />} />
              <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data: { mood: string }) => router.push(`/archive?mood=${encodeURIComponent(data.mood)}`)} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </main>
  )
}
