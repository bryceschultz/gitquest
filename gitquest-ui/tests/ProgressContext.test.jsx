import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ProgressProvider } from '../src/context/ProgressContext'
import { useProgress } from '../src/context/useProgress'
import { STORAGE_KEY } from '../src/context/context'

// A tiny consumer that exposes the context API through the DOM so the
// provider can be exercised the way the real app uses it.
function Harness() {
  const { progress, completeLevel, setMode, purchaseItem, setPlacement, resetProgress } = useProgress()
  return (
    <div>
      <div data-testid="completed">{progress.completedLevels.join(',')}</div>
      <div data-testid="mode">{String(progress.mode)}</div>
      <div data-testid="score">{String(progress.scores['M1L1'])}</div>
      <div data-testid="achievements">{Object.keys(progress.achievements).join(',')}</div>
      <div data-testid="inventory">{progress.inventory.join(',')}</div>
      <div data-testid="spent">{progress.spentCoins}</div>
      <div data-testid="placement">{progress.placement ? progress.placement.recommendedMission : 'none'}</div>
      <button onClick={() => completeLevel('M1L1', 100)}>complete-m1l1</button>
      <button onClick={() => completeLevel('M1L1', 50)}>complete-m1l1-again-lower</button>
      <button onClick={() => setMode('vet')}>set-vet</button>
      <button onClick={() => purchaseItem(1, 30)}>buy-item</button>
      <button onClick={() => setPlacement({ correct: 7, total: 8, pct: 88, passed: true, recommendedMission: 'M2' })}>place</button>
      <button onClick={resetProgress}>reset</button>
    </div>
  )
}

const renderHarness = () => render(<ProgressProvider><Harness /></ProgressProvider>)

beforeEach(() => localStorage.clear())

describe('ProgressContext', () => {
  test('completing a lesson updates state, records the score, and earns First Blood', () => {
    renderHarness()
    fireEvent.click(screen.getByText('complete-m1l1'))
    expect(screen.getByTestId('completed')).toHaveTextContent('M1L1')
    expect(screen.getByTestId('score')).toHaveTextContent('100')
    expect(screen.getByTestId('achievements').textContent).toContain('first-blood')
    expect(screen.getByTestId('achievements').textContent).toContain('clean-commit')
  })

  test('replay never duplicates completion and keeps the best score', () => {
    renderHarness()
    fireEvent.click(screen.getByText('complete-m1l1'))
    fireEvent.click(screen.getByText('complete-m1l1-again-lower'))
    expect(screen.getByTestId('completed').textContent).toBe('M1L1')
    expect(screen.getByTestId('score')).toHaveTextContent('100')
  })

  test('progress persists to localStorage and is rehydrated on remount (refresh survival)', () => {
    const { unmount } = renderHarness()
    fireEvent.click(screen.getByText('complete-m1l1'))
    fireEvent.click(screen.getByText('set-vet'))
    unmount()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored.completedLevels).toEqual(['M1L1'])
    expect(stored.mode).toBe('vet')

    renderHarness()
    expect(screen.getByTestId('completed')).toHaveTextContent('M1L1')
    expect(screen.getByTestId('mode')).toHaveTextContent('vet')
  })

  test('corrupt stored JSON falls back to defaults instead of crashing', () => {
    localStorage.setItem(STORAGE_KEY, '{{{not json')
    renderHarness()
    expect(screen.getByTestId('completed').textContent).toBe('')
    expect(screen.getByTestId('mode')).toHaveTextContent('null')
  })

  test('purchases are guarded: insufficient balance is refused, double-purchase is refused', () => {
    renderHarness()
    // No completions yet → 0 coins → refuse
    fireEvent.click(screen.getByText('buy-item'))
    expect(screen.getByTestId('inventory').textContent).toBe('')

    // One completion (10) is still < 30 → refuse
    fireEvent.click(screen.getByText('complete-m1l1'))
    fireEvent.click(screen.getByText('buy-item'))
    expect(screen.getByTestId('inventory').textContent).toBe('')

    // Manufacture enough coins by seeding storage, remount, then buy once.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    stored.completedLevels = ['M1L1', 'M1L2', 'M1L3']
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  })

  test('a funded purchase succeeds exactly once and persists spentCoins', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedLevels: ['M1L1', 'M1L2', 'M1L3'] }))
    renderHarness()
    fireEvent.click(screen.getByText('buy-item'))
    expect(screen.getByTestId('inventory')).toHaveTextContent('1')
    expect(screen.getByTestId('spent')).toHaveTextContent('30')
    fireEvent.click(screen.getByText('buy-item')) // double purchase refused
    expect(screen.getByTestId('inventory').textContent).toBe('1')
    expect(screen.getByTestId('spent')).toHaveTextContent('30')
  })

  test('placement result is stored with a date and reset clears everything', () => {
    renderHarness()
    fireEvent.click(screen.getByText('place'))
    expect(screen.getByTestId('placement')).toHaveTextContent('M2')

    fireEvent.click(screen.getByText('complete-m1l1'))
    fireEvent.click(screen.getByText('reset'))
    expect(screen.getByTestId('completed').textContent).toBe('')
    expect(screen.getByTestId('placement')).toHaveTextContent('none')
    expect(screen.getByTestId('achievements').textContent).toBe('')
  })
})
