import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import Arsenal from '../src/components/Arsenal'
import { STORAGE_KEY } from '../src/context/context'

// Adapted from Preeti's PR #14 Arsenal suite (pre-redesign markup) to the
// current component: derived balance, guarded purchases, honest prototypes.

const seed = (completed, spent = 0, inventory = []) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevels: completed, spentCoins: spent, inventory }))

const renderArsenal = () => render(<ProgressProvider><Arsenal onBack={() => {}} /></ProgressProvider>)

beforeEach(() => localStorage.clear())

describe('Arsenal (adapted from PR #14)', () => {
  test('balance derives from completed lessons', () => {
    seed(['M1L1', 'M1L2', 'M1L3']) // 30 coins
    renderArsenal()
    expect(screen.getAllByText(/💰 30/).length).toBeGreaterThanOrEqual(1)
  })

  test('an unaffordable item shows INSUFFICIENT and cannot be bought', () => {
    seed(['M1L1']) // 10 coins < 30 cost
    renderArsenal()
    const buy = screen.getAllByText(/INSUFFICIENT/)[0]
    expect(buy).toBeDisabled()
  })

  test('an affordable purchase succeeds, persists, and deducts the balance', () => {
    seed(['M1L1', 'M1L2', 'M1L3']) // 30 = Auto-hint cost
    renderArsenal()
    fireEvent.click(screen.getAllByText('ACQUIRE')[0])
    expect(screen.getByText(/EQUIPPED/)).toBeInTheDocument()
    expect(screen.getByText(/💰 0/)).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.inventory).toContain(1)
    expect(stored.spentCoins).toBe(30)
  })

  test('owned items cannot be purchased twice', () => {
    seed(['M1L1', 'M1L2', 'M1L3', 'M1L4', 'M1L5', 'M1L6'], 0, [1])
    renderArsenal()
    const equipped = screen.getByText(/EQUIPPED/)
    expect(equipped).toBeDisabled()
  })

  test('cosmetic prototypes say so honestly', () => {
    seed([])
    renderArsenal()
    expect(screen.getAllByText(/prototype/i).length).toBeGreaterThanOrEqual(1)
  })
})
