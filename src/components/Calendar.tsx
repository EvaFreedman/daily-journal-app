"use client"

import { useState } from "react"

type Props = {
  daysWithEntries: Set<string>   // set of "YYYY-MM-DD" strings
  selected: string | null        // "YYYY-MM-DD" or null
  onSelect: (day: string | null) => void
  allDaysSelectable?: boolean    // if true, every day is clickable regardless of entries
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export default function Calendar({ daysWithEntries, selected, onSelect, allDaysSelectable = false }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Build the grid: find the Monday on or before the 1st of the month
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startDay = new Date(firstOfMonth)
  const dowOfFirst = (firstOfMonth.getDay() + 6) % 7 // Mon=0 … Sun=6
  startDay.setDate(startDay.getDate() - dowOfFirst)

  const cells: Date[] = []
  const cursor = new Date(startDay)
  while (cells.length < 42) {
    cells.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", {
    month: "long", year: "numeric",
  })

  return (
    <div className="rounded-lg border border-zinc-200 p-3 select-none max-w-56">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="text-zinc-400 hover:text-zinc-700 px-1 text-base leading-none"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-zinc-700">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="text-zinc-400 hover:text-zinc-700 px-1 text-base leading-none"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-zinc-400 font-medium py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const ymd = toYMD(date)
          const isCurrentMonth = date.getMonth() === viewMonth
          const hasEntries = daysWithEntries.has(ymd)
          const isClickable = allDaysSelectable ? isCurrentMonth : hasEntries
          const isSelected = selected === ymd
          const isToday = toYMD(today) === ymd

          return (
            <button
              key={ymd}
              disabled={!isClickable}
              onClick={() => onSelect(isSelected ? null : ymd)}
              className={`
                flex items-center justify-center rounded-full text-[11px] transition-colors mx-auto w-6 h-6
                ${!isCurrentMonth ? "text-zinc-300" : ""}
                ${isCurrentMonth && !isClickable ? "text-zinc-400 cursor-default" : ""}
                ${isClickable && !isSelected ? "text-zinc-900 font-semibold hover:bg-zinc-100 cursor-pointer" : ""}
                ${isSelected ? "bg-zinc-900 text-white font-semibold" : ""}
                ${isToday && !isSelected ? "ring-1 ring-zinc-300" : ""}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-2 text-center">
          <button
            onClick={() => onSelect(null)}
            className="text-[10px] text-zinc-400 hover:text-zinc-600"
          >
            Clear date filter
          </button>
        </div>
      )}
    </div>
  )
}
