import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import TrainingPage from '../src/components/TrainingPage'
import { MISSIONS } from '../src/missions/Missions'

const originalMission = JSON.parse(JSON.stringify(MISSIONS.M1.levels.M1L2))

const withProvider = (ui) => render(<ProgressProvider>{ui}</ProgressProvider>)

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
  MISSIONS.M1.levels.M1L2 = JSON.parse(JSON.stringify(originalMission))
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

test('empty input via click leaves execute disabled when hint exists', () => {
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={() => {}} />)

  const input = screen.getByPlaceholderText('enter command...')
  const button = screen.getByText('Execute')

  expect(input).toHaveValue('')
  expect(button).toBeDisabled()
  expect(screen.queryByText(/✗ REJECTED/)).not.toBeInTheDocument()
  expect(screen.queryByText(/HINT:/)).not.toBeInTheDocument()
})

test('empty input via Enter and retry shows no hint when hint is absent', () => {
  delete MISSIONS.M1.levels.M1L2.battle.hint
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  const input = screen.getByPlaceholderText('enter command...')
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  expect(screen.getByText(/✗ REJECTED/)).toBeInTheDocument()
  expect(screen.getByText('Retry')).toBeInTheDocument()

  fireEvent.click(screen.getByText('Retry'))
  expect(input).toHaveValue('')
  expect(screen.queryByText(/HINT:/)).not.toBeInTheDocument()
  expect(onComplete).not.toHaveBeenCalled()
})

test('incorrect command via click on first attempt shows reject without hint', () => {
  delete MISSIONS.M1.levels.M1L2.battle.hint
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  fireEvent.change(screen.getByPlaceholderText('enter command...'), { target: { value: 'git status' } })
  fireEvent.click(screen.getByText('Execute'))

  expect(screen.getByText(/✗ REJECTED/)).toBeInTheDocument()
  expect(screen.queryByText(/HINT:/)).not.toBeInTheDocument()
  expect(onComplete).not.toHaveBeenCalled()
})

test('incorrect command via Enter then retry shows hint when hint exists', () => {
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  const input = screen.getByPlaceholderText('enter command...')
  fireEvent.change(input, { target: { value: 'git status' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  expect(screen.getByText(/✗ REJECTED/)).toBeInTheDocument()
  fireEvent.click(screen.getByText('Retry'))

  expect(screen.getByText(/HINT:/)).toBeInTheDocument()
  expect(onComplete).not.toHaveBeenCalled()
})

test('correct command via click after one failure completes when hint exists', () => {
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  const input = screen.getByPlaceholderText('enter command...')
  fireEvent.change(input, { target: { value: 'git status' } })
  fireEvent.click(screen.getByText('Execute'))

  fireEvent.click(screen.getByText('Retry'))
  fireEvent.change(input, { target: { value: 'git pull' } })
  fireEvent.click(screen.getByText('Execute'))

  expect(screen.getByText(/✓ COMMAND ACCEPTED/)).toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(1200)
  })

  expect(screen.getByText('Continue ▶')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Continue ▶'))
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test('correct command via Enter on first attempt completes without hint', () => {
  delete MISSIONS.M1.levels.M1L2.battle.hint
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  const input = screen.getByPlaceholderText('enter command...')
  fireEvent.change(input, { target: { value: 'git pull' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  expect(screen.getByText(/✓ COMMAND ACCEPTED/)).toBeInTheDocument()
  expect(screen.queryByText(/HINT:/)).not.toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(1200)
  })

  expect(screen.getByText('Continue ▶')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Continue ▶'))
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test('correct command with whitespace via click on first attempt is accepted and uses hint data', () => {
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  fireEvent.change(screen.getByPlaceholderText('enter command...'), { target: { value: '  git pull  ' } })
  fireEvent.click(screen.getByText('Execute'))

  expect(screen.getByText(/✓ COMMAND ACCEPTED/)).toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(1200)
  })

  expect(screen.getByText('Continue ▶')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Continue ▶'))
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test('correct command with whitespace via Enter after retry completes without hint', () => {
  delete MISSIONS.M1.levels.M1L2.battle.hint
  const onComplete = jest.fn()
  withProvider(<TrainingPage questId="M1" levelId="M1L2" onBack={() => {}} onComplete={onComplete} />)

  const input = screen.getByPlaceholderText('enter command...')
  fireEvent.change(input, { target: { value: 'git status' } })
  fireEvent.click(screen.getByText('Execute'))

  fireEvent.click(screen.getByText('Retry'))
  fireEvent.change(input, { target: { value: '  git pull  ' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  expect(screen.getByText(/✓ COMMAND ACCEPTED/)).toBeInTheDocument()
  act(() => {
    jest.advanceTimersByTime(1200)
  })

  expect(screen.getByText('Continue ▶')).toBeInTheDocument()
  fireEvent.click(screen.getByText('Continue ▶'))
  expect(onComplete).toHaveBeenCalledTimes(1)
})
