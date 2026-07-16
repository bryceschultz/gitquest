import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import TrainingPage from '../src/components/TrainingPage'
import { STORAGE_KEY } from '../src/context/context'
import { MISSIONS } from '../src/missions/Missions'
import { isLevelUnlocked } from '../src/game/unlocks'

const renderLesson = (levelId, questId, props = {}) =>
  render(
    <ProgressProvider>
      <TrainingPage
        levelId={levelId}
        questId={questId}
        onBack={() => {}}
        onComplete={props.onComplete ?? (() => {})}
        onNextLevel={props.onNextLevel ?? (() => {})}
      />
    </ProgressProvider>
  )

const typeAndExecute = (value) => {
  fireEvent.change(screen.getByLabelText('command input'), { target: { value } })
  fireEvent.click(screen.getByText('Execute'))
}

beforeEach(() => {
  localStorage.clear()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('TrainingPage — single-command battle', () => {
  test('renders tutorial content and the battle scenario', () => {
    renderLesson('M1L3', 'M1')
    expect(screen.getByRole('heading', { name: 'git status' })).toBeInTheDocument()
    expect(screen.getByText(/HANDLER BRIEFING/)).toBeInTheDocument()
    expect(screen.getByLabelText('command input')).toBeInTheDocument()
  })

  test('a correct first-try answer completes the lesson with a 100 score and persists it', () => {
    renderLesson('M1L3', 'M1')
    typeAndExecute('git status')
    expect(screen.getByText(/COMMAND ACCEPTED/)).toBeInTheDocument()

    act(() => jest.runAllTimers())
    expect(screen.getByText(/OBJECTIVE SECURED/)).toBeInTheDocument()
    expect(screen.getByText(/ASSESSMENT SCORE: 100 \/ 100/)).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.completedLevels).toContain('M1L3')
    expect(stored.scores['M1L3']).toBe(100)
  })

  test('empty input gets a specific message, not a generic rejection', () => {
    renderLesson('M1L3', 'M1')
    fireEvent.click(screen.getByText('Execute'))
    expect(screen.getByText(/didn\u2019t enter a command/)).toBeInTheDocument()
  })

  test('a wrong command gets a targeted diagnostic and allows retry', () => {
    renderLesson('M1L3', 'M1')
    typeAndExecute('git log')
    expect(screen.getByText(/won\u2019t accomplish this objective/)).toBeInTheDocument()

    // retry directly in the same field
    typeAndExecute('git status')
    expect(screen.getByText(/COMMAND ACCEPTED/)).toBeInTheDocument()
  })

  test('hint timing: reveal button after 1 wrong attempt, automatic after 2, and the score reflects it', () => {
    renderLesson('M1L3', 'M1')
    expect(screen.queryByText(/^HINT:/)).not.toBeInTheDocument()

    typeAndExecute('git wrong')
    expect(screen.getByText(/reveal hint/)).toBeInTheDocument()
    expect(screen.queryByText(/^HINT:/)).not.toBeInTheDocument()

    typeAndExecute('git wronger')
    expect(screen.getByText(/HINT:/)).toBeInTheDocument()

    typeAndExecute('git status')
    act(() => jest.runAllTimers())
    // 2 wrong attempts (−50) + hint (−10) → 40
    expect(screen.getByText(/ASSESSMENT SCORE: 40 \/ 100/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).hintsUsed).toBe(1)
  })

  test('a lesson-specific reject rule shows its teaching message (git add .)', () => {
    renderLesson('M1L4', 'M1')
    typeAndExecute('git add .')
    expect(screen.getByText(/stages EVERYTHING/)).toBeInTheDocument()
  })

  test('accepted variants pass (git switch for checkout)', () => {
    renderLesson('M3L2', 'M3')
    typeAndExecute('git switch decoy-operation')
    expect(screen.getByText(/COMMAND ACCEPTED/)).toBeInTheDocument()
  })

  test('completion offers Next lesson once completing this one unlocks it', () => {
    const onNextLevel = jest.fn()
    renderLesson('M1L1', 'M1', { onNextLevel })
    typeAndExecute('git clone https://github.com/us-cyber/shadow-breach.git')
    act(() => jest.runAllTimers())
    fireEvent.click(screen.getByText(/Next lesson/))
    expect(onNextLevel).toHaveBeenCalledWith('M1L2', 'M1')
  })

  test('completion hides Next lesson when the next lesson is still locked (out-of-order replay in recruit mode)', () => {
    // A recruit replaying M2L1 (e.g. via imported progress) must not be able
    // to jump to a locked M2L2 from the completion panel.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevels: ['M1L3'], mode: 'new' }))
    renderLesson('M1L3', 'M1')
    typeAndExecute('git status')
    act(() => jest.runAllTimers())
    expect(screen.queryByText(/Next lesson/)).not.toBeInTheDocument()
  })

  test('unknown lesson id shows the missing-data screen instead of crashing', () => {
    renderLesson('Z9M9', 'Z9')
    expect(screen.getByText(/No training data found/)).toBeInTheDocument()
  })
})

describe('TrainingPage — sequence battles (feature kept for future boss missions)', () => {
  // The current storyline has no multi-step mission, but the sequence-battle
  // engine remains supported. Exercise it against a synthetic lesson injected
  // into the registry.
  const syntheticBoss = {
    id: 'T1M1',
    cmd: 'sequence-test',
    diff: 'hard',
    title: 'sequence test',
    subtitle: 'synthetic',
    briefing: 'test',
    sections: [{ heading: 'What it does', body: 'test' }],
    battle: {
      type: 'sequence',
      steps: [
        {
          objective: 'Check the field',
          scenario: 'First check state.',
          expected: 'git status',
          accept: ['git status'],
          hint: 'status',
          success: 'State confirmed.',
        },
        {
          objective: 'Download only',
          scenario: 'Fetch without merging.',
          expected: 'git fetch',
          accept: ['git fetch'],
          reject: [{ cmd: 'git pull', message: 'STEP FAILED — download only.' }],
          hint: 'fetch',
          success: 'Downloaded.',
        },
      ],
    },
  }

  beforeEach(() => {
    MISSIONS.T1 = { id: 'T1', x: 0, y: 0, title: 'Test — Synthetic', levels: { T1M1: syntheticBoss } }
  })
  afterEach(() => {
    delete MISSIONS.T1
  })

  test('steps advance in order, step rejects fail only the current step, completion averages scores', () => {
    renderLesson('T1M1', 'T1')
    expect(screen.getByText('STEP 1 / 2')).toBeInTheDocument()

    typeAndExecute('git status')
    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument()

    // step-specific reject fires; the step does NOT advance
    typeAndExecute('git pull')
    expect(screen.getByText(/STEP FAILED/)).toBeInTheDocument()
    expect(screen.getByText('STEP 2 / 2')).toBeInTheDocument()

    typeAndExecute('git fetch')
    act(() => jest.advanceTimersByTime(2000))

    expect(screen.getByText(/OBJECTIVE SECURED/)).toBeInTheDocument()
    // one perfect step (100) + one step with a wrong attempt (75) -> avg 88
    expect(screen.getByText(/ASSESSMENT SCORE: 88 \/ 100/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).completedLevels).toContain('T1M1')
  })
})

describe('TrainingPage — level completion outro', () => {
  test('finishing the last mission of a level shows the storyline celebration', () => {
    // Everything in M1 done except the push lesson; completing it clears the mission.
    const allButPush = ['M1L1','M1L2','M1L3','M1L4','M1L5','M1FA']
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevels: allButPush, mode: 'new' }))
    renderLesson('M1L6', 'M1')
    typeAndExecute('git push')
    act(() => jest.runAllTimers())
    expect(screen.getByText(/Field Ready/)).toBeInTheDocument()
    expect(screen.getByText(/Mission 2 clearance granted/)).toBeInTheDocument()
  })

  test('finishing a mid-level mission does not show the celebration', () => {
    renderLesson('M1L1', 'M1')
    typeAndExecute('git clone https://github.com/us-cyber/shadow-breach.git')
    act(() => jest.runAllTimers())
    expect(screen.queryByText(/Field Ready/)).not.toBeInTheDocument()
  })
})

describe('Field Assignment 1 — the real daily-loop sequence', () => {
  test('runs clone → status → add → commit → push, enforcing step rejects, and completes the mission finale', () => {
    renderLesson('M1FA', 'M1')
    expect(screen.getByText('STEP 1 / 5')).toBeInTheDocument()

    typeAndExecute('git clone https://github.com/us-cyber/shadow-breach.git')
    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByText('STEP 2 / 5')).toBeInTheDocument()

    typeAndExecute('git status')
    act(() => jest.advanceTimersByTime(2000))

    // Step 3 rejects the catch-all stage with a teaching message
    typeAndExecute('git add .')
    expect(screen.getByText(/stages EVERYTHING/)).toBeInTheDocument()
    expect(screen.getByText('STEP 3 / 5')).toBeInTheDocument()
    typeAndExecute('git add attack-report.txt')
    act(() => jest.advanceTimersByTime(2000))

    // Step 4 accepts any commit message via the <message> placeholder
    typeAndExecute('git commit -m "my own words entirely"')
    act(() => jest.advanceTimersByTime(2000))

    typeAndExecute('git push')
    act(() => jest.advanceTimersByTime(2000))

    expect(screen.getByText(/OBJECTIVE SECURED/)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).completedLevels).toContain('M1FA')
  })

  test('the field assignment is locked for a recruit until every M1 lesson is complete', () => {
    // isLevelUnlocked is registry-order driven; M1FA is last in Mission 1.
    const progress = { completedLevels: ['M1L1','M1L2','M1L3','M1L4','M1L5'], mode: 'new' }
    expect(isLevelUnlocked('M1FA', progress)).toBe(false)
    expect(isLevelUnlocked('M1FA', { ...progress, completedLevels: [...progress.completedLevels, 'M1L6'] })).toBe(true)
  })
})
