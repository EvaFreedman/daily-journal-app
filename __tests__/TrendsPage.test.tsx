import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Trends from '@/app/trends/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/trends',
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock Recharts — jsdom can't measure DOM elements so charts won't render meaningfully,
// but we can verify the page structure around them.
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
}))

// Mock storage
const mockGetEntries = vi.fn()
vi.mock('@/lib/storage', () => ({
  getEntries: () => mockGetEntries(),
}))

function makeEntry(id: string, date: string, moodScore: number, mood = 'Happy') {
  return { id, date, text: `Entry ${id}`, mood, moodScore }
}

beforeEach(() => {
  mockGetEntries.mockReturnValue([])
})

describe('Trends page', () => {
  it('shows empty state when there are fewer than 2 scored entries', () => {
    mockGetEntries.mockReturnValue([
      makeEntry('1', '2026-04-01T12:00:00.000Z', 7),
    ])
    render(<Trends />)
    expect(screen.getByText(/write a few more entries/i)).toBeDefined()
  })

  it('shows empty state when there are no entries at all', () => {
    mockGetEntries.mockReturnValue([])
    render(<Trends />)
    expect(screen.getByText(/write a few more entries/i)).toBeDefined()
  })

  it('renders the Trends heading', () => {
    mockGetEntries.mockReturnValue([
      makeEntry('1', '2026-04-01T12:00:00.000Z', 7),
      makeEntry('2', '2026-04-02T12:00:00.000Z', 5),
    ])
    render(<Trends />)
    expect(screen.getByRole('heading', { name: 'Trends' })).toBeDefined()
  })

  it('shows the hover instruction text', () => {
    mockGetEntries.mockReturnValue([
      makeEntry('1', '2026-04-01T12:00:00.000Z', 7),
      makeEntry('2', '2026-04-02T12:00:00.000Z', 5),
    ])
    render(<Trends />)
    expect(screen.getByText(/hover a point to preview entries/i)).toBeDefined()
  })

  it('renders all three chart section headings', () => {
    mockGetEntries.mockReturnValue([
      makeEntry('1', '2026-04-01T12:00:00.000Z', 7),
      makeEntry('2', '2026-04-02T12:00:00.000Z', 5),
    ])
    render(<Trends />)
    expect(screen.getByText(/mood score over time/i)).toBeDefined()
    expect(screen.getByText(/score distribution/i)).toBeDefined()
    expect(screen.getByText(/mood frequency/i)).toBeDefined()
  })

  it('does not render mood frequency section when no entries have moods', () => {
    mockGetEntries.mockReturnValue([
      { id: '1', date: '2026-04-01T12:00:00.000Z', text: 'Entry', moodScore: 7 },
      { id: '2', date: '2026-04-02T12:00:00.000Z', text: 'Entry', moodScore: 5 },
    ])
    render(<Trends />)
    expect(screen.queryByText(/mood frequency/i)).toBeNull()
  })

  it('only uses entries that have a moodScore', () => {
    // One scored entry + one unscored — should still show empty state (needs 2 scored)
    mockGetEntries.mockReturnValue([
      makeEntry('1', '2026-04-01T12:00:00.000Z', 7),
      { id: '2', date: '2026-04-02T12:00:00.000Z', text: 'No score yet' },
    ])
    render(<Trends />)
    expect(screen.getByText(/write a few more entries/i)).toBeDefined()
  })
})
