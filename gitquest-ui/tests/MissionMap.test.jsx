import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import MissionMap from '../src/components/MissionMap'
import { MISSIONS } from '../src/missions/Missions'

// Mission map has 4 independent dimensions: quest_locked (locked/unlocked),
// completion (none/partial/all), quest_done (done/not_done), and action
// (start/close/arsenal/trophy) — 48 combinations. Cases below are an all-pairs
// reduction, so each test targets a distinct pair combo.
//
// handleQuestClick refuses to select a locked quest, so a locked quest can never
// open its panel. Locked + start/close cases therefore assert the panel stays shut.
// Arsenal and Intel room live on the map itself, so they stay reachable either way.

const M1_LEVELS = ['M1L1', 'M1L2', 'M1L3', 'M1L4', 'M1L5']

const COMPLETION = {
  none: [],
  partial: M1_LEVELS.slice(0, 2),
  all: M1_LEVELS,
}

const originalM1 = { locked: MISSIONS.M1.locked, done: MISSIONS.M1.done }

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  MISSIONS.M1.locked = originalM1.locked
  MISSIONS.M1.done = originalM1.done
})

const seed = ({ locked, done, completed }) => {
  MISSIONS.M1.locked = locked
  MISSIONS.M1.done = done
  localStorage.setItem('gitquest-progress', JSON.stringify({ completedLevels: completed }))
}

const renderMap = () => {
  const props = {
    onBack: jest.fn(),
    onStartLevel: jest.fn(),
    onOpenArsenal: jest.fn(),
    onOpenTrophy: jest.fn(),
  }
  render(
    <ProgressProvider>
      <MissionMap {...props} />
    </ProgressProvider>
  )
  return props
}

const clickQuestNode = () => fireEvent.click(screen.getByText('M1'))

test('case 1: locked + none complete + done — clicking the node never opens the panel', () => {
  seed({ locked: true, done: true, completed: COMPLETION.none })
  const { onStartLevel } = renderMap()

  clickQuestNode()

  expect(screen.queryByText(/LEVELS/)).not.toBeInTheDocument()
  expect(screen.queryByText(/Start/)).not.toBeInTheDocument()
  expect(onStartLevel).not.toHaveBeenCalled()
})

test('case 2: locked + partial + not_done — Intel room still opens the trophy room', () => {
  seed({ locked: true, done: false, completed: COMPLETION.partial })
  const { onOpenTrophy } = renderMap()

  fireEvent.click(screen.getByText(/Intel room/))

  expect(onOpenTrophy).toHaveBeenCalledTimes(1)
})

test('case 3: locked + all complete + done — Arsenal button still opens the arsenal', () => {
  seed({ locked: true, done: true, completed: COMPLETION.all })
  const { onOpenArsenal } = renderMap()

  fireEvent.click(screen.getByText(/Arsenal/))

  expect(onOpenArsenal).toHaveBeenCalledTimes(1)
})

test('case 4: unlocked + none complete + not_done — panel opens at 0/5 and closes on dismiss', () => {
  seed({ locked: false, done: false, completed: COMPLETION.none })
  renderMap()

  clickQuestNode()

  expect(screen.getByText(/LEVELS 0\/5/)).toBeInTheDocument()
  expect(screen.queryByText(/Revisit training/)).not.toBeInTheDocument()

  fireEvent.click(screen.getByText('✕'))

  expect(screen.queryByText(/LEVELS 0\/5/)).not.toBeInTheDocument()
})

test('case 5: unlocked + partial + done — Arsenal button opens the arsenal', () => {
  seed({ locked: false, done: true, completed: COMPLETION.partial })
  const { onOpenArsenal } = renderMap()

  fireEvent.click(screen.getByText(/Arsenal/))

  expect(onOpenArsenal).toHaveBeenCalledTimes(1)
})

test('case 6: unlocked + all complete + done — Intel room opens the trophy room', () => {
  seed({ locked: false, done: true, completed: COMPLETION.all })
  const { onOpenTrophy } = renderMap()

  fireEvent.click(screen.getByText(/Intel room/))

  expect(onOpenTrophy).toHaveBeenCalledTimes(1)
})

test('case 7: locked + all complete + done — panel stays shut so there is nothing to dismiss', () => {
  seed({ locked: true, done: true, completed: COMPLETION.all })
  renderMap()

  clickQuestNode()

  expect(screen.queryByText('✕')).not.toBeInTheDocument()
  expect(screen.queryByText(/LEVELS/)).not.toBeInTheDocument()
})

test('case 8: unlocked + all complete + not_done — Start hands back an undefined level id', () => {
  seed({ locked: false, done: false, completed: COMPLETION.all })
  const { onStartLevel } = renderMap()

  clickQuestNode()
  expect(screen.getByText(/LEVELS 5\/5/)).toBeInTheDocument()

  fireEvent.click(screen.getByText(/Start/))

  // Known defect: nextLevelId resolves to undefined once every level is complete.
  expect(onStartLevel).toHaveBeenCalledWith(undefined, 'M1')
})

test('case 9: locked + none complete + not_done — Arsenal button works while locked', () => {
  seed({ locked: true, done: false, completed: COMPLETION.none })
  const { onOpenArsenal } = renderMap()

  fireEvent.click(screen.getByText(/Arsenal/))

  expect(onOpenArsenal).toHaveBeenCalledTimes(1)
})

test('case 10: locked + none complete + done — Intel room works while locked', () => {
  seed({ locked: true, done: true, completed: COMPLETION.none })
  const { onOpenTrophy } = renderMap()

  fireEvent.click(screen.getByText(/Intel room/))

  expect(onOpenTrophy).toHaveBeenCalledTimes(1)
})

test('case 11: unlocked + partial + done — Start resumes at the first incomplete level', () => {
  seed({ locked: false, done: true, completed: COMPLETION.partial })
  const { onStartLevel } = renderMap()

  clickQuestNode()

  expect(screen.getByText(/LEVELS 2\/5/)).toBeInTheDocument()
  expect(screen.getByText(/Revisit training/)).toBeInTheDocument()

  fireEvent.click(screen.getByText(/Start/))

  expect(onStartLevel).toHaveBeenCalledWith('M1L3', 'M1')
})

test('case 12: locked + partial + done — panel stays shut', () => {
  seed({ locked: true, done: true, completed: COMPLETION.partial })
  renderMap()

  clickQuestNode()

  expect(screen.queryByText(/LEVELS/)).not.toBeInTheDocument()
})
