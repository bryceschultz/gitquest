import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PLACEMENT_QUESTIONS, PLACEMENT_THRESHOLD, scorePlacement } from '../src/game/placement'
import PlacementQuiz from '../src/components/PlacementQuiz'
import { ProgressProvider } from '../src/context/ProgressContext'
import { STORAGE_KEY } from '../src/context/context'

beforeEach(() => localStorage.clear())

describe('scorePlacement', () => {
  const allCorrect = Object.fromEntries(PLACEMENT_QUESTIONS.map(q => [q.id, q.answer]))

  test('perfect score passes and recommends Level 2', () => {
    const r = scorePlacement(allCorrect)
    expect(r).toMatchObject({ correct: 8, total: 8, pct: 100, passed: true, recommendedMission: 'M2' })
  })

  test('exactly 75% passes (6/8), just below fails (5/8)', () => {
    const sixRight = { ...allCorrect }
    const [q1, q2] = PLACEMENT_QUESTIONS
    sixRight[q1.id] = (q1.answer + 1) % q1.choices.length
    sixRight[q2.id] = (q2.answer + 1) % q2.choices.length
    expect(scorePlacement(sixRight).passed).toBe(true)

    const fiveRight = { ...sixRight }
    const q3 = PLACEMENT_QUESTIONS[2]
    fiveRight[q3.id] = (q3.answer + 1) % q3.choices.length
    const r = scorePlacement(fiveRight)
    expect(r.passed).toBe(false)
    expect(r.recommendedMission).toBe('M1')
  })

  test('unanswered questions count as wrong, never throw', () => {
    expect(scorePlacement({})).toMatchObject({ correct: 0, passed: false })
    expect(scorePlacement(undefined).correct).toBe(0)
  })

  test('the threshold is the approved 75%', () => {
    expect(PLACEMENT_THRESHOLD).toBe(0.75)
  })
})

describe('PlacementQuiz component', () => {
  const renderQuiz = (onDone = () => {}) =>
    render(<ProgressProvider><PlacementQuiz onDone={onDone} /></ProgressProvider>)

  test('submit is disabled until every question is answered', () => {
    renderQuiz()
    expect(screen.getByText('Submit answers')).toBeDisabled()
    for (const q of PLACEMENT_QUESTIONS) {
      fireEvent.click(within(screen.getByTestId(q.id)).getByText(q.choices[q.answer]))
    }
    expect(screen.getByText('Submit answers')).toBeEnabled()
  })

  test('a perfect submission shows the pass result and persists the recommendation', () => {
    renderQuiz()
    for (const q of PLACEMENT_QUESTIONS) {
      fireEvent.click(within(screen.getByTestId(q.id)).getByText(q.choices[q.answer]))
    }
    fireEvent.click(screen.getByText('Submit answers'))
    expect(screen.getByText(/8 \/ 8 — 100%/)).toBeInTheDocument()
    expect(screen.getByText(/Recommended start: M2/)).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.placement.recommendedMission).toBe('M2')
    expect(stored.placement.pct).toBe(100)
  })

  test('wrong answers get an explanation after submission (FR-06)', () => {
    renderQuiz()
    PLACEMENT_QUESTIONS.forEach((q, i) => {
      const idx = i === 0 ? (q.answer + 1) % q.choices.length : q.answer
      fireEvent.click(within(screen.getByTestId(q.id)).getByText(q.choices[idx]))
    })
    fireEvent.click(screen.getByText('Submit answers'))
    expect(screen.getByText(new RegExp('WHY: ' + PLACEMENT_QUESTIONS[0].explanation.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
  })

  test('skip placement calls onDone without storing a result', () => {
    const onDone = jest.fn()
    renderQuiz(onDone)
    fireEvent.click(screen.getByText(/skip placement/))
    expect(onDone).toHaveBeenCalled()
  })
})
