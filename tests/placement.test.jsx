import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
    PLACEMENT_QUESTION_BANK,
    PLACEMENT_QUESTION_COUNT,
    PLACEMENT_THRESHOLD,
    getPlacementSet,
    scorePlacement,
} from '../src/data/placement'

describe('getPlacementSet', () => {
    test('draws PLACEMENT_QUESTION_COUNT (10) questions by default', () => {
        const set = getPlacementSet()
        expect(set).toHaveLength(PLACEMENT_QUESTION_COUNT)
    })

    test('every drawn question comes from the bank, with no duplicates', () => {
        const set = getPlacementSet()
        const bankIds = new Set(PLACEMENT_QUESTION_BANK.map(q => q.id))
        const setIds = set.map(q => q.id)
        expect(new Set(setIds).size).toBe(setIds.length) // no dupes
        setIds.forEach(id => expect(bankIds.has(id)).toBe(true))
    })

    test('respects a smaller requested count', () => {
        expect(getPlacementSet(3)).toHaveLength(3)
    })

    test('caps at the pool size if count exceeds it', () => {
        expect(getPlacementSet(9999)).toHaveLength(PLACEMENT_QUESTION_BANK.length)
    })
})

describe('scorePlacement', () => {
    // Fixed 8-question slice so these tests are deterministic regardless of
    // random draw behavior.
    const fixedSet = PLACEMENT_QUESTION_BANK.slice(0, 8)
    const allCorrect = Object.fromEntries(fixedSet.map(q => [q.id, q.answer]))

    test('perfect score passes and recommends Level 2', () => {
        const r = scorePlacement(fixedSet, allCorrect)
        expect(r).toMatchObject({ correct: 8, total: 8, pct: 100, passed: true, recommendedLevel: 2 })
    })

    test('exactly 75% passes (6/8), just below fails (5/8) and recommends Level 1', () => {
        const sixRight = { ...allCorrect }
        const [q1, q2] = fixedSet
        sixRight[q1.id] = (q1.answer + 1) % q1.choices.length
        sixRight[q2.id] = (q2.answer + 1) % q2.choices.length
        expect(scorePlacement(fixedSet, sixRight).passed).toBe(true)

        const fiveRight = { ...sixRight }
        const q3 = fixedSet[2]
        fiveRight[q3.id] = (q3.answer + 1) % q3.choices.length
        const r = scorePlacement(fixedSet, fiveRight)
        expect(r.passed).toBe(false)
        expect(r.recommendedLevel).toBe(1)
    })

    test('unanswered questions count as wrong, never throw', () => {
        expect(scorePlacement(fixedSet, {})).toMatchObject({ correct: 0, passed: false })
        expect(scorePlacement(fixedSet, undefined).correct).toBe(0)
        expect(scorePlacement([], {})).toMatchObject({ correct: 0, total: 0, pct: 0, passed: false })
    })

    test('the threshold is the approved 75%', () => {
        expect(PLACEMENT_THRESHOLD).toBe(0.75)
    })
})

// ── Component tests ──────────────────────────────────────────────
// getPlacementSet is mocked to a fixed slice so the rendered questions are
// deterministic; scorePlacement/PLACEMENT_THRESHOLD use the real
// implementation.
const FIXED_SET = PLACEMENT_QUESTION_BANK.slice(0, PLACEMENT_QUESTION_COUNT)

jest.mock('../src/game/placement', () => {
    const actual = jest.requireActual('../src/game/placement')
    return {
        ...actual,
        getPlacementSet: () => actual.PLACEMENT_QUESTION_BANK.slice(0, actual.PLACEMENT_QUESTION_COUNT),
    }
})

// eslint-disable-next-line import/first
import PlacementQuiz from '../src/components/PlacementQuiz'

describe('PlacementQuiz component', () => {
    beforeEach(() => {
        global.fetch = jest.fn((url) => {
            if (String(url).includes('/levels')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ levels: [
                            { levelNumber: 1, title: 'Basic Training' },
                            { levelNumber: 2, title: 'Field Operations' },
                        ]}),
                })
            }
            if (String(url).includes('/agents/placement')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ agent: {} }),
                })
            }
            return Promise.reject(new Error(`Unexpected fetch: ${url}`))
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderQuiz = (onDone = () => {}) => render(<PlacementQuiz onDone={onDone} />)

    test('renders exactly 10 questions', () => {
        renderQuiz()
        expect(screen.getAllByText(/^Q\d+\./)).toHaveLength(PLACEMENT_QUESTION_COUNT)
    })

    test('submit is disabled until every question is answered', () => {
        renderQuiz()
        expect(screen.getByText('Submit answers')).toBeDisabled()
        for (const q of FIXED_SET) {
            fireEvent.click(screen.getByText(q.choices[q.answer]))
        }
        expect(screen.getByText('Submit answers')).toBeEnabled()
    })

    test('a perfect submission shows the pass result and posts it to the backend', async () => {
        renderQuiz()
        for (const q of FIXED_SET) {
            fireEvent.click(screen.getByText(q.choices[q.answer]))
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/10 \/ 10 — 100%/)).toBeInTheDocument()
        expect(await screen.findByText(/Recommended start: Level 2 — Field Operations/)).toBeInTheDocument()

        await waitFor(() => {
            const placementCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/agents/placement'))
            expect(placementCall).toBeTruthy()
            const body = JSON.parse(placementCall[1].body)
            expect(body).toMatchObject({ recommendedLevel: 2, pct: 100, correct: 10, total: 10, passed: true })
        })
    })

    test('a failing submission recommends Level 1 and still saves', async () => {
        renderQuiz()
        // Answer everything wrong (offset by one choice)
        for (const q of FIXED_SET) {
            const wrongIdx = (q.answer + 1) % q.choices.length
            fireEvent.click(screen.getByText(q.choices[wrongIdx]))
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/0 \/ 10 — 0%/)).toBeInTheDocument()
        expect(await screen.findByText(/Recommended start: Level 1 — Basic Training/)).toBeInTheDocument()
        expect(await screen.findByText(/All missions remain open to you/)).toBeInTheDocument()
    })

    test('wrong answers get an explanation after submission (FR-06)', async () => {
        renderQuiz()
        FIXED_SET.forEach((q, i) => {
            const idx = i === 0 ? (q.answer + 1) % q.choices.length : q.answer
            fireEvent.click(screen.getAllByText(q.choices[idx])[0])
        })
        fireEvent.click(screen.getByText('Submit answers'))

        const snippet = FIXED_SET[0].explanation.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        expect(await screen.findByText(new RegExp('WHY: ' + snippet))).toBeInTheDocument()
    })

    test('a failed save shows a non-blocking error but still lets the player continue', async () => {
        global.fetch = jest.fn((url) => {
            if (String(url).includes('/levels')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: [] }) })
            }
            if (String(url).includes('/agents/placement')) {
                return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'nope' }) })
            }
            return Promise.reject(new Error('unexpected'))
        })

        renderQuiz()
        for (const q of FIXED_SET) {
            fireEvent.click(screen.getByText(q.choices[q.answer]))
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/Couldn't save your result/)).toBeInTheDocument()
        expect(screen.getByText('To the mission map ▶')).toBeEnabled()
    })

    test('skip placement calls onDone without submitting anything', () => {
        const onDone = jest.fn()
        renderQuiz(onDone)
        fireEvent.click(screen.getByText(/skip placement/))
        expect(onDone).toHaveBeenCalled()
        expect(global.fetch).not.toHaveBeenCalled()
    })
})