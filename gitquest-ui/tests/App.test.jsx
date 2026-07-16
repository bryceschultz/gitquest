import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../src/App'

beforeEach(() => localStorage.clear())

describe('App shell routing', () => {
  test('new recruit: welcome → mission map with derived 0% progress and recruit badge', () => {
    render(<App />)
    expect(screen.getByText('New recruit')).toBeInTheDocument()

    fireEvent.click(screen.getByText('New recruit'))
    expect(screen.getByText(/OVERALL PROGRESS — 0%/)).toBeInTheDocument()
    expect(screen.getByText('NEW RECRUIT')).toBeInTheDocument()
    expect(screen.getByText(/🎖 0\/4/)).toBeInTheDocument()
    expect(screen.getByText(/💰 0/)).toBeInTheDocument()
  })

  test('field agent: welcome → placement assessment, skip → map with field agent badge', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Field agent'))
    expect(screen.getByText('Placement assessment')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/skip placement/))
    expect(screen.getByText('FIELD AGENT')).toBeInTheDocument()
  })

  test('a returning field agent with a stored placement result goes straight to the map with the recommendation banner', () => {
    localStorage.setItem('gitquest-progress', JSON.stringify({
      mode: 'vet',
      placement: { correct: 7, total: 8, pct: 88, passed: true, recommendedMission: 'M2' },
    }))
    render(<App />)
    fireEvent.click(screen.getByText('Field agent'))
    expect(screen.queryByText('Placement assessment')).not.toBeInTheDocument()
    expect(screen.getByText(/recommended start: M2 — Damage Control: Reading & Undoing/)).toBeInTheDocument()
  })

  test('opening a mission from the map shows its lessons with lock states, and Start opens the training page', () => {
    render(<App />)
    fireEvent.click(screen.getByText('New recruit'))

    fireEvent.click(screen.getByText('M1')) // map node label
    expect(screen.getByText('Mission 1 — First Contact: The Daily Loop')).toBeInTheDocument()
    expect(screen.getByText(/M1L1 — git clone/)).toBeInTheDocument()
    // second lesson is locked for a fresh recruit
    expect(screen.getByText(/M1L2 — git pull/).closest('button')).toBeDisabled()

    fireEvent.click(screen.getByText(/▶ Start/))
    expect(screen.getByRole('heading', { name: 'git clone' })).toBeInTheDocument()
    expect(screen.getByLabelText('command input')).toBeInTheDocument()
  })
})

describe('App — advancing to the next lesson resets the training view (regression)', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('Next lesson shows the new lesson, not the previous completion panel', () => {
    localStorage.setItem('gitquest-progress', JSON.stringify({ mode: 'vet', placement: { correct: 8, total: 8, pct: 100, passed: true, recommendedMission: 'M2' } }))
    render(<App />)
    fireEvent.click(screen.getByText('Field agent'))

    fireEvent.click(screen.getByText('M1'))
    fireEvent.click(screen.getByText(/\u25B6 Start/))

    // Solve L1M1 (git clone)
    fireEvent.change(screen.getByLabelText('command input'), { target: { value: 'git clone https://github.com/us-cyber/shadow-breach.git' } })
    fireEvent.click(screen.getByText('Execute'))
    act(() => jest.runAllTimers())
    expect(screen.getByText(/OBJECTIVE SECURED/)).toBeInTheDocument()

    // Advance — the view must reset to L1M2 with a fresh command input,
    // not carry over the previous OBJECTIVE SECURED panel.
    fireEvent.click(screen.getByText(/Next lesson/))
    expect(screen.queryByText(/OBJECTIVE SECURED/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'git pull' })).toBeInTheDocument()
    expect(screen.getByLabelText('command input')).toBeInTheDocument()
    expect(screen.getByLabelText('command input').value).toBe('')
  })
})

describe('App — assignment grouping in the mission panel', () => {
  test('the panel shows assignment headers and the Field Assignment finale', () => {
    render(<App />)
    fireEvent.click(screen.getByText('New recruit'))
    fireEvent.click(screen.getByText('M1'))
    expect(screen.getByText(/ASSIGNMENT 1.1 — GET THE INTEL/)).toBeInTheDocument()
    expect(screen.getByText(/ASSIGNMENT 1.2 — REPORT IN/)).toBeInTheDocument()
    expect(screen.getByText(/FIELD ASSIGNMENT — all commands, in sequence/)).toBeInTheDocument()
    // the finale row exists and is locked for a fresh recruit
    expect(screen.getByText(/M1FA — FIELD ASSIGNMENT/).closest('button')).toBeDisabled()
    // frequency-first: push lives in Mission 1
    expect(screen.getByText(/M1L6 — git push/)).toBeInTheDocument()
  })
})
