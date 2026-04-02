import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Calendar from '@/components/Calendar'

const EMPTY = new Set<string>()

function makeSet(...dates: string[]) {
  return new Set(dates)
}

describe('Calendar', () => {
  it('renders the current month and year', () => {
    const now = new Date()
    const expected = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    expect(screen.getByText(expected)).toBeDefined()
  })

  it('renders day-of-week headers', () => {
    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    for (const day of ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']) {
      expect(screen.getByText(day)).toBeDefined()
    }
  })

  it('disables days with no entries when allDaysSelectable is false', () => {
    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    const buttons = screen.getAllByRole('button').filter(b =>
      b.textContent && /^\d+$/.test(b.textContent.trim())
    )
    // All date buttons should be disabled since daysWithEntries is empty
    buttons.forEach(b => expect((b as HTMLButtonElement).disabled).toBe(true))
  })

  it('enables all current-month days when allDaysSelectable is true', () => {
    render(
      <Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} allDaysSelectable />
    )
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const enabledButtons = screen
      .getAllByRole('button')
      .filter(b => b.textContent && /^\d+$/.test(b.textContent.trim()) && !(b as HTMLButtonElement).disabled)
    expect(enabledButtons.length).toBe(daysInMonth)
  })

  it('calls onSelect with correct YYYY-MM-DD when a day with entries is clicked', () => {
    const onSelect = vi.fn()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const targetYMD = `${year}-${month}-05`

    render(
      <Calendar
        daysWithEntries={makeSet(targetYMD)}
        selected={null}
        onSelect={onSelect}
      />
    )

    // Find the enabled button for day 5 and click it
    const buttons = screen.getAllByRole('button').filter(
      b => b.textContent?.trim() === '5' && !(b as HTMLButtonElement).disabled
    )
    expect(buttons.length).toBeGreaterThan(0)
    fireEvent.click(buttons[0])
    expect(onSelect).toHaveBeenCalledWith(targetYMD)
  })

  it('calls onSelect with null when the selected day is clicked again (deselect)', () => {
    const onSelect = vi.fn()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const targetYMD = `${year}-${month}-05`

    render(
      <Calendar
        daysWithEntries={makeSet(targetYMD)}
        selected={targetYMD}
        onSelect={onSelect}
      />
    )

    const buttons = screen.getAllByRole('button').filter(
      b => b.textContent?.trim() === '5' && !(b as HTMLButtonElement).disabled
    )
    fireEvent.click(buttons[0])
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('navigates to the previous month', () => {
    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1)
    const expected = prevMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    fireEvent.click(screen.getByText('‹'))
    expect(screen.getByText(expected)).toBeDefined()
  })

  it('navigates to the next month', () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1)
    const expected = nextMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    fireEvent.click(screen.getByText('›'))
    expect(screen.getByText(expected)).toBeDefined()
  })

  it('shows clear date filter button when a date is selected', () => {
    const now = new Date()
    const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    render(
      <Calendar daysWithEntries={makeSet(ymd)} selected={ymd} onSelect={() => {}} />
    )
    expect(screen.getByText('Clear date filter')).toBeDefined()
  })

  it('does not show clear date filter button when nothing is selected', () => {
    render(<Calendar daysWithEntries={EMPTY} selected={null} onSelect={() => {}} />)
    expect(screen.queryByText('Clear date filter')).toBeNull()
  })
})
