import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import MissionMap from '../src/components/MissionMap'
import { STORAGE_KEY } from '../src/context/context'

// ————————————————————————————————————————————————————————————————
// Adapted from Preeti's PR #14 pairwise (AllPairs) MissionMap suite.
// Her design dimensions are preserved: mission lock state × completion
// level × side-panel action. Selectors updated to the redesigned map
// ("Trophy room"/"Arsenal" buttons, assignment-grouped panel, recruit
// sequential locks).
// ————————————————————————————————————————————————————————————————

const M1_ALL = ['M1L1','M1L2','M1L3','M1L4','M1L5','M1L6','M1FA']

const renderMap = (progressSeed, handlers = {}) => {
  if (progressSeed) localStorage.setItem(STORAGE_KEY, JSON.stringify(progressSeed))
  const onStartLevel = handlers.onStartLevel ?? jest.fn()
  const onOpenArsenal = handlers.onOpenArsenal ?? jest.fn()
  const onOpenTrophy = handlers.onOpenTrophy ?? jest.fn()
  render(
    <ProgressProvider>
      <MissionMap onBack={() => {}} onStartLevel={onStartLevel}
        onOpenArsenal={onOpenArsenal} onOpenTrophy={onOpenTrophy} />
    </ProgressProvider>
  )
  return { onStartLevel, onOpenArsenal, onOpenTrophy }
}

beforeEach(() => localStorage.clear())

describe('MissionMap — pairwise: lock state × completion × action (adapted from PR #14)', () => {
  test('case 1: locked mission + none complete — clicking the node never opens the panel', () => {
    renderMap({ mode: 'new', completedLevels: [] })
    fireEvent.click(screen.getByText('M2')) // locked for a fresh recruit
    expect(screen.queryByText(/Mission 2 — Damage Control/)).not.toBeInTheDocument()
  })

  test('case 2: locked mission + partial progress — Trophy room still opens', () => {
    const { onOpenTrophy } = renderMap({ mode: 'new', completedLevels: ['M1L1'] })
    fireEvent.click(screen.getByText(/Trophy room/))
    expect(onOpenTrophy).toHaveBeenCalled()
  })

  test('case 3: locked mission + M1 fully complete — Arsenal still opens', () => {
    const { onOpenArsenal } = renderMap({ mode: 'new', completedLevels: M1_ALL })
    fireEvent.click(screen.getByText(/Arsenal/))
    expect(onOpenArsenal).toHaveBeenCalled()
  })

  test('case 4: unlocked mission + none complete — panel opens at 0/7 and closes on dismiss', () => {
    renderMap({ mode: 'new', completedLevels: [] })
    fireEvent.click(screen.getByText('M1'))
    expect(screen.getByText(/LEVELS 0\/7/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByText(/LEVELS 0\/7/)).not.toBeInTheDocument()
  })

  test('case 5: unlocked mission + partial — Start resumes at the first incomplete lesson', () => {
    const { onStartLevel } = renderMap({ mode: 'new', completedLevels: ['M1L1', 'M1L2'] })
    fireEvent.click(screen.getByText('M1'))
    fireEvent.click(screen.getByText(/▶ Start/))
    expect(onStartLevel).toHaveBeenCalledWith('M1L3', 'M1')
  })

  test('case 6: unlocked mission + all complete — Replay starts back at the first lesson', () => {
    const { onStartLevel } = renderMap({ mode: 'new', completedLevels: M1_ALL })
    fireEvent.click(screen.getByText('M1'))
    fireEvent.click(screen.getByText(/▶ Replay/))
    expect(onStartLevel).toHaveBeenCalledWith('M1L1', 'M1')
  })

  test('case 7: completing M1 unlocks M2 — its panel now opens', () => {
    renderMap({ mode: 'new', completedLevels: M1_ALL })
    fireEvent.click(screen.getByText('M2'))
    expect(screen.getByText(/Mission 2 — Damage Control/)).toBeInTheDocument()
  })

  test('case 8: field agent + none complete — every mission opens despite zero progress', () => {
    renderMap({ mode: 'vet', completedLevels: [] })
    fireEvent.click(screen.getByText('M4'))
    expect(screen.getByText(/Mission 4 — Ghost Protocol/)).toBeInTheDocument()
  })

  test('case 9: derived topbar reflects completion (coins and mission count)', () => {
    renderMap({ mode: 'new', completedLevels: M1_ALL })
    expect(screen.getByText(/🎖 1\/4/)).toBeInTheDocument()
    expect(screen.getByText(/💰 95/)).toBeInTheDocument() // 7×10 + 25 bonus
  })

  test('case 10: locked lesson rows inside an open panel are disabled', () => {
    renderMap({ mode: 'new', completedLevels: [] })
    fireEvent.click(screen.getByText('M1'))
    expect(screen.getByText(/M1L2 — git pull/).closest('button')).toBeDisabled()
    expect(screen.getByText(/M1L1 — git clone/).closest('button')).toBeEnabled()
  })
})
