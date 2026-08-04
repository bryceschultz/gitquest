import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
    PLACEMENT_QUESTION_BANK,
    PLACEMENT_QUESTION_COUNT,
    LEVEL_THRESHOLDS,
    getPlacementSet,
    scorePlacement,
    recommendedLevelForPct,
} from '../src/data/placement'

describe('getPlacementSet', () => {
    test('draws PLACEMENT_QUESTION_COUNT (10) questions by default', () => {
        expect(getPlacementSet()).toHaveLength(PLACEMENT_QUESTION_COUNT)
    })

    test('every drawn question comes from the bank, with no duplicates', () => {
        const set = getPlacementSet()
        const bankIds = new Set(PLACEMENT_QUESTION_BANK.map(q => q.id))
        const setIds = set.map(q => q.id)
        expect(new Set(setIds).size).toBe(setIds.length)
        setIds.forEach(id => expect(bankIds.has(id)).toBe(true))
    })
})

describe('recommendedLevelForPct', () => {
    test('0-49% recommends Level 1', () => {
        expect(recommendedLevelForPct(0)).toBe(1)
        expect(recommendedLevelForPct(49)).toBe(1)
    })
    test('50-74% recommends Level 2', () => {
        expect(recommendedLevelForPct(50)).toBe(2)
        expect(recommendedLevelForPct(74)).toBe(2)
    })
    test('75-100% recommends Level 3', () => {
        expect(recommendedLevelForPct(75)).toBe(3)
        expect(recommendedLevelForPct(100)).toBe(3)
    })
    test('thresholds are the approved 0/50/75 split', () => {
        expect(LEVEL_THRESHOLDS.map(t => t.minPct)).toEqual([75, 50, 0])
    })
})

describe('scorePlacement', () => {
    const fixedSet = PLACEMENT_QUESTION_BANK.slice(0, 10)
    const allCorrect = Object.fromEntries(fixedSet.map(q => [q.id, q.answer]))

    test('perfect score (100%) recommends Level 3', () => {
        const r = scorePlacement(fixedSet, allCorrect)
        expect(r).toMatchObject({ correct: 10, total: 10, pct: 100, recommendedLevel: 3 })
    })

    test('a mid-range score (50-74%) recommends Level 2', () => {
        const sixRight = { ...allCorrect }
        for (let i = 0; i < 4; i++) {
            const q = fixedSet[i]
            sixRight[q.id] = (q.answer + 1) % q.choices.length
        }
        const r = scorePlacement(fixedSet, sixRight)
        expect(r.pct).toBe(60)
        expect(r.recommendedLevel).toBe(2)
    })

    test('a low score (<50%) recommends Level 1', () => {
        const twoRight = { ...allCorrect }
        for (let i = 0; i < 8; i++) {
            const q = fixedSet[i]
            twoRight[q.id] = (q.answer + 1) % q.choices.length
        }
        const r = scorePlacement(fixedSet, twoRight)
        expect(r.pct).toBe(20)
        expect(r.recommendedLevel).toBe(1)
    })

    test('unanswered questions count as wrong, never throw', () => {
        expect(scorePlacement(fixedSet, {})).toMatchObject({ correct: 0, recommendedLevel: 1 })
        expect(scorePlacement(fixedSet, undefined).correct).toBe(0)
        expect(scorePlacement([], {})).toMatchObject({ correct: 0, total: 0, pct: 0, recommendedLevel: 1 })
    })
})

// ── Component tests ──────────────────────────────────────────────
// getPlacementSet is mocked to a fixed slice so the rendered questions are
// deterministic; scorePlacement/recommendedLevelForPct use the real
// implementation.
const FIXED_SET = PLACEMENT_QUESTION_BANK.slice(0, PLACEMENT_QUESTION_COUNT)

jest.mock('../src/placement', () => {
    const actual = jest.requireActual('../src/placement')
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
                            { levelNumber: 3, title: 'Deep Cover' },
                        ]}),
                })
            }
            if (String(url).includes('/agents/placement')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ agent: { rank: 'Field Agent' } }),
                })
            }
            return Promise.reject(new Error(`Unexpected fetch: ${url}`))
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderQuiz = (onDone = () => {}) => render(<PlacementQuiz onDone={onDone} />)

    const answer = (q, idx = q.answer) => fireEvent.click(screen.getByText(q.choices[idx]))
    const clickNext = () => fireEvent.click(screen.getByText('Next →'))

    test('shows one question at a time', () => {
        renderQuiz()
        expect(screen.getByText(FIXED_SET[0].prompt)).toBeInTheDocument()
        expect(screen.queryByText(FIXED_SET[1].prompt)).not.toBeInTheDocument()
        expect(screen.getByText('Question 1 / 10')).toBeInTheDocument()
    })

    test('Next is disabled until the current question is answered, then advances', () => {
        renderQuiz()
        expect(screen.getByText('Next →')).toBeDisabled()
        answer(FIXED_SET[0])
        expect(screen.getByText('Next →')).toBeEnabled()
        clickNext()
        expect(screen.getByText(FIXED_SET[1].prompt)).toBeInTheDocument()
        expect(screen.queryByText(FIXED_SET[0].prompt)).not.toBeInTheDocument()
        expect(screen.getByText('Question 2 / 10')).toBeInTheDocument()
    })

    test('Back returns to the previous question and preserves the earlier answer', () => {
        renderQuiz()
        answer(FIXED_SET[0])
        clickNext()
        fireEvent.click(screen.getByText('← Back'))
        expect(screen.getByText(FIXED_SET[0].prompt)).toBeInTheDocument()
        // previously selected choice still highlighted / Next still enabled without re-clicking
        expect(screen.getByText('Next →')).toBeEnabled()
    })

    test('the last question shows "Submit answers" instead of "Next"', () => {
        renderQuiz()
        for (let i = 0; i < FIXED_SET.length - 1; i++) {
            answer(FIXED_SET[i])
            clickNext()
        }
        expect(screen.getByText(FIXED_SET[FIXED_SET.length - 1].prompt)).toBeInTheDocument()
        expect(screen.queryByText('Next →')).not.toBeInTheDocument()
        expect(screen.getByText('Submit answers')).toBeInTheDocument()
    })

    test('a perfect run shows Level 3 and posts recommendedLevel 3', async () => {
        renderQuiz()
        for (let i = 0; i < FIXED_SET.length; i++) {
            answer(FIXED_SET[i])
            if (i < FIXED_SET.length - 1) clickNext()
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/10 \/ 10 — 100%/)).toBeInTheDocument()
        expect(await screen.findByText(/Level 3 — Deep Cover/)).toBeInTheDocument()

        await waitFor(() => {
            const call = global.fetch.mock.calls.find(([url]) => String(url).includes('/agents/placement'))
            expect(call).toBeTruthy()
            expect(JSON.parse(call[1].body)).toMatchObject({ recommendedLevel: 3, pct: 100, correct: 10, total: 10 })
        })
    })

    test('a poor run recommends Level 1, and every mission is still described as unlocked', async () => {
        renderQuiz()
        for (let i = 0; i < FIXED_SET.length; i++) {
            const q = FIXED_SET[i]
            answer(q, (q.answer + 1) % q.choices.length)
            if (i < FIXED_SET.length - 1) clickNext()
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/0 \/ 10 — 0%/)).toBeInTheDocument()
        expect(await screen.findByText(/Level 1 — Basic Training/)).toBeInTheDocument()
        expect(await screen.findByText(/Every mission is unlocked for you regardless/)).toBeInTheDocument()
    })

    test('wrong answers get an explanation on the result screen (FR-06)', async () => {
        renderQuiz()
        for (let i = 0; i < FIXED_SET.length; i++) {
            const q = FIXED_SET[i]
            const idx = i === 0 ? (q.answer + 1) % q.choices.length : q.answer
            answer(q, idx)
            if (i < FIXED_SET.length - 1) clickNext()
        }
        fireEvent.click(screen.getByText('Submit answers'))

        const snippet = FIXED_SET[0].explanation.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        expect(await screen.findByText(new RegExp('WHY: ' + snippet))).toBeInTheDocument()
    })

    test('onDone receives the updated agent (with new rank) after a full submission', async () => {
        const onDone = jest.fn()
        renderQuiz(onDone)
        for (let i = 0; i < FIXED_SET.length; i++) {
            answer(FIXED_SET[i])
            if (i < FIXED_SET.length - 1) clickNext()
        }
        fireEvent.click(screen.getByText('Submit answers'))

        fireEvent.click(await screen.findByText('To the mission map ▶'))
        expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ rank: 'Field Agent' }))
    })

    test('skip placement still unlocks free-roam via the backend, from any question', async () => {
        const onDone = jest.fn()
        renderQuiz(onDone)
        answer(FIXED_SET[0])
        clickNext() // move to question 2 before skipping

        fireEvent.click(screen.getByText(/skip placement/))

        await waitFor(() => {
            const call = global.fetch.mock.calls.find(([url]) => String(url).includes('/agents/placement'))
            expect(call).toBeTruthy()
            expect(JSON.parse(call[1].body)).toMatchObject({ skipped: true })
        })
        await waitFor(() => expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ rank: 'Field Agent' })))
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
        for (let i = 0; i < FIXED_SET.length; i++) {
            answer(FIXED_SET[i])
            if (i < FIXED_SET.length - 1) clickNext()
        }
        fireEvent.click(screen.getByText('Submit answers'))

        expect(await screen.findByText(/Couldn't save your result/)).toBeInTheDocument()
        expect(screen.getByText('To the mission map ▶')).toBeEnabled()
    })
})