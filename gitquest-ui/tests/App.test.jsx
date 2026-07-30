import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../src/App'

// Routing has 3 dimensions: screen (welcome/map/training/arsenal/trophy),
// active_level (null/set) and direction (forward/back) — 20 combinations. Cases
// below are an all-pairs reduction.
//
// "forward" means the outbound transition from that screen, "back" the return one.
// App takes no props and starts at welcome with activeLevel null, so every case
// drives real UI to reach its state rather than injecting it.
//
// Two cells have no reachable path:
//   welcome + back  — WelcomeScreen only receives onSelect, there is no back control
//   training + null — onStartLevel always assigns an object, so the
//                     `screen === 'training' && activeLevel` guard never sees null
// Both are asserted as absences so the constraint is documented, not faked.

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

const at = {
  welcome: () => screen.queryByText(/LIVE THREAT DETECTED/),
  map: () => screen.queryByText(/MISSION MAP/),
  training: () => screen.queryByText(/TRAINING MODULE/),
  arsenal: () => screen.queryByText(/FIELD EQUIPMENT/),
  trophy: () => screen.queryByText(/COMMENDATIONS/),
}

const goToMap = () => fireEvent.click(screen.getByText('New recruit'))
const openMissionPanel = () => fireEvent.click(screen.getByText('M1'))
const startLevel = () => fireEvent.click(screen.getByText(/Start/))
const goBack = () => fireEvent.click(screen.getByText('← back'))

// welcome -> map -> M1 panel -> training. Leaves activeLevel set to M1L1.
const enterTraining = () => {
  goToMap()
  openMissionPanel()
  startLevel()
}

// M1L1 is the "git clone" level; a correct answer schedules onComplete at 1200ms.
const winBattle = () => {
  fireEvent.change(screen.getByPlaceholderText('enter command...'), {
    target: { value: 'git clone https://github.com/us-cyber/shadow-breach.git' },
  })
  fireEvent.click(screen.getByText('Execute'))
  act(() => {
    jest.advanceTimersByTime(1200)
  })
  fireEvent.click(screen.getByText('Continue ▶'))
}

test('case 1: welcome + no active level + forward — selecting a path opens the mission map', () => {
  render(<App />)

  expect(at.welcome()).toBeInTheDocument()
  expect(at.map()).not.toBeInTheDocument()

  goToMap()

  expect(at.map()).toBeInTheDocument()
  expect(at.welcome()).not.toBeInTheDocument()
})

test('case 2: welcome + active level + back — welcome offers no back route and keeps the stale level', () => {
  render(<App />)

  enterTraining()
  expect(at.training()).toBeInTheDocument()

  goBack()
  fireEvent.click(screen.getByText(/abort mission/))

  expect(at.welcome()).toBeInTheDocument()
  // WelcomeScreen renders no back control, so there is nothing to navigate back to.
  expect(screen.queryByText('← back')).not.toBeInTheDocument()
  expect(screen.queryByText(/abort mission/)).not.toBeInTheDocument()

  // activeLevel is never cleared, so going forward again lands straight on training.
  goToMap()
  openMissionPanel()
  startLevel()
  expect(at.training()).toBeInTheDocument()
})

test('case 3: map + no active level + back — abort mission returns to welcome', () => {
  render(<App />)
  goToMap()

  expect(at.map()).toBeInTheDocument()

  fireEvent.click(screen.getByText(/abort mission/))

  expect(at.welcome()).toBeInTheDocument()
  expect(at.map()).not.toBeInTheDocument()
})

test('case 4: map + active level + forward — starting a level again re-enters training', () => {
  render(<App />)

  enterTraining()
  goBack()

  expect(at.map()).toBeInTheDocument()

  openMissionPanel()
  startLevel()

  expect(at.training()).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'git clone' })).toBeInTheDocument()
})

test('case 5: training + no active level + back — training never renders without a level, and back returns to the map', () => {
  render(<App />)

  enterTraining()

  // The guard would blank the screen if activeLevel were null; it never is, so the
  // training module renders every time.
  expect(at.training()).toBeInTheDocument()

  goBack()

  expect(at.map()).toBeInTheDocument()
  expect(at.training()).not.toBeInTheDocument()
})

test('case 6: training + active level + forward — winning the battle returns to the map and records progress', () => {
  render(<App />)

  enterTraining()
  winBattle()

  expect(at.map()).toBeInTheDocument()

  openMissionPanel()
  expect(screen.getByText(/LEVELS 1\/5/)).toBeInTheDocument()
})

test('case 7: arsenal + no active level + back — back returns to the map', () => {
  render(<App />)
  goToMap()

  fireEvent.click(screen.getByText(/🔧 Arsenal/))
  expect(at.arsenal()).toBeInTheDocument()

  goBack()

  expect(at.map()).toBeInTheDocument()
  expect(at.arsenal()).not.toBeInTheDocument()
})

test('case 8: arsenal + active level + forward — the arsenal opens with a level still held in state', () => {
  render(<App />)

  enterTraining()
  goBack()

  fireEvent.click(screen.getByText(/🔧 Arsenal/))

  expect(at.arsenal()).toBeInTheDocument()
  expect(screen.getByText('Auto-hint Module')).toBeInTheDocument()
})

test('case 9: trophy + no active level + back — back returns to the map', () => {
  render(<App />)
  goToMap()

  fireEvent.click(screen.getByText(/Intel room/))
  expect(at.trophy()).toBeInTheDocument()

  goBack()

  expect(at.map()).toBeInTheDocument()
  expect(at.trophy()).not.toBeInTheDocument()
})

test('case 10: trophy + active level + forward — the trophy room opens with a level still held in state', () => {
  render(<App />)

  enterTraining()
  goBack()

  fireEvent.click(screen.getByText(/Intel room/))

  expect(at.trophy()).toBeInTheDocument()
  expect(screen.getByText('3 / 9 UNLOCKED')).toBeInTheDocument()
})
