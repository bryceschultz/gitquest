import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import TrophyRoom from '../src/components/TrophyRoom'
import { STORAGE_KEY } from '../src/context/context'

// Adapted from Preeti's PR #14 TrophyRoom suite to the derived-state
// redesign: badges + field record computed from progress, earn dates kept.

const renderRoom = (seed) => {
  if (seed) localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  render(<ProgressProvider><TrophyRoom onBack={() => {}} /></ProgressProvider>)
}

beforeEach(() => localStorage.clear())

describe('TrophyRoom (adapted from PR #14)', () => {
  test('fresh state: nothing earned, all badges locked', () => {
    renderRoom(null)
    expect(screen.getByText(/0 \/ 7 UNLOCKED/)).toBeInTheDocument()
    expect(screen.getByText(/No trophies yet/)).toBeInTheDocument()
  })

  test('earned achievements render with their stored earn date', () => {
    renderRoom({ completedLevels: ['M1L1'], achievements: { 'first-blood': '2026-07-01' } })
    expect(screen.getByText(/EARNED 2026-07-01/)).toBeInTheDocument()
  })

  test('field record derives from progress (battles won, coins earned)', () => {
    renderRoom({ completedLevels: ['M1L1', 'M1L2'], scores: { M1L1: 100, M1L2: 50 } })
    expect(screen.getByText('2 / 36')).toBeInTheDocument()   // battles won
    expect(screen.getByText('20')).toBeInTheDocument()        // coins earned
    expect(screen.getByText('75 / 100')).toBeInTheDocument()  // average score
  })
})
