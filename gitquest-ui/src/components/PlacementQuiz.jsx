import { useState } from 'react'
import { getPlacementSet, scorePlacement } from '../data/placement'

const BASE_URL = import.meta.env.VITE_API_URL //
//const BASE_URL = 'http://localhost:5001/api'

// Placement assessment for the Field Agent route (FR-06, S3-02).
// A random subset of PLACEMENT_QUESTION_BANK is drawn once per attempt,
// shown one question at a time. Score maps to a recommended starting
// level (see placement.js). Skippable — either way, choosing Field Agent
// unlocks free-roam access to every mission; the quiz only affects where
// HQ suggests you begin.
export default function PlacementQuiz({ onDone }) {
    const [questions]           = useState(() => getPlacementSet())
    const [index, setIndex]     = useState(0)
    const [answers, setAnswers] = useState({})
    const [result, setResult]   = useState(null)
    const [levelTitle, setLevelTitle] = useState(null)
    const [saving, setSaving]   = useState(false)
    const [saveError, setSaveError] = useState(null)

    const current    = questions[index]
    const isLast      = index === questions.length - 1
    const isAnswered  = answers[current.id] !== undefined

    function selectChoice(ci) {
        setAnswers(a => ({ ...a, [current.id]: ci }))
    }

    function handleNext() {
        if (!isAnswered) return
        setIndex(i => Math.min(i + 1, questions.length - 1))
    }

    function handleBack() {
        setIndex(i => Math.max(i - 1, 0))
    }

    async function persist(body) {
        setSaving(true)
        setSaveError(null)
        try {
            const res = await fetch(`${BASE_URL}/agents/placement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save placement result')
            return data.agent
        } catch (err) {
            setSaveError(err.message)
            return null
        } finally {
            setSaving(false)
        }
    }

    async function handleSubmit() {
        if (!isAnswered) return
        const r = scorePlacement(questions, answers)
        setResult(r)

        // Best-effort lookup of a friendly level name — falls back to the
        // numeric level if this fails, so it never blocks showing the result.
        try {
            const lvlRes = await fetch(`${BASE_URL}/levels`, { credentials: 'include' })
            if (lvlRes.ok) {
                const { levels } = await lvlRes.json()
                const match = levels?.find(l => l.levelNumber === r.recommendedLevel)
                if (match?.title) setLevelTitle(match.title)
            }
        } catch {
            // non-critical — numeric level still displays
        }

        const updatedAgent = await persist({
            recommendedLevel: r.recommendedLevel,
            pct:               r.pct,
            correct:           r.correct,
            total:             r.total,
        })

        setResult(prev => ({ ...prev, updatedAgent }))
    }

    async function handleSkip() {
        const updatedAgent = await persist({ skipped: true })
        onDone(updatedAgent)
    }

    function handleContinue() {
        onDone(result?.updatedAgent)
    }

    // ── Result screen ────────────────────────────────────────────
    if (result) {
        return (
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 8 }}>FIELD AGENT INTAKE</div>
                <h1 style={{ fontSize: 22, fontWeight: 500, color: '#00ff88', fontFamily: 'monospace', marginBottom: 6 }}>Placement assessment</h1>

                {questions.map((q, qi) => {
                    const chosen = answers[q.id]
                    const isCorrect = chosen === q.answer
                    return (
                        <div key={q.id} style={{ marginBottom: '1.75rem', background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 10, padding: '1.25rem' }}>
                            <div style={{ fontSize: 13, color: '#c8daf0', fontFamily: 'monospace', lineHeight: 1.7, marginBottom: '0.9rem' }}>
                                <span style={{ color: '#4a6fa5' }}>Q{qi + 1}. </span>{q.prompt}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {q.choices.map((choice, ci) => {
                                    const selected = chosen === ci
                                    let border = '#1a2a45'
                                    let color = '#4a6fa5'
                                    if (ci === q.answer) { border = '#00ff88'; color = '#00ff88' }
                                    else if (selected) { border = '#e24b4a'; color = '#e24b4a' }
                                    return (
                                        <div
                                            key={ci}
                                            style={{
                                                textAlign: 'left', background: '#080c17', border: `1px solid ${border}`,
                                                borderRadius: 8, padding: '9px 14px', color, fontFamily: 'monospace',
                                                fontSize: 12, lineHeight: 1.6,
                                            }}
                                        >
                                            {choice}
                                        </div>
                                    )
                                })}
                            </div>
                            {!isCorrect && (
                                <div style={{ marginTop: 10, fontSize: 12, color: '#e4a020', fontFamily: 'monospace', lineHeight: 1.7, background: '#1a1005', border: '1px solid #a0600033', borderRadius: 8, padding: '10px 14px' }}>
                                    WHY: {q.explanation}
                                </div>
                            )}
                        </div>
                    )
                })}

                <div style={{ textAlign: 'center', border: '1px solid #00ff8844', borderRadius: 12, background: '#0d1f15', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#00ff88', marginBottom: 6 }}>
                        {result.correct} / {result.total} — {result.pct}%
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#c8daf0', marginBottom: '0.75rem', lineHeight: 1.7 }}>
                        {`HQ recommends starting at Level ${result.recommendedLevel}${levelTitle ? ` — ${levelTitle}` : ''}. Every mission is unlocked for you regardless — this is just a starting suggestion.`}
                    </div>
                    {saveError && (
                        <div style={{ fontSize: 11, color: '#e24b4a', fontFamily: 'monospace', marginBottom: '1rem' }}>
                            ✘ Couldn't save your result to HQ records — you can still continue.
                        </div>
                    )}
                    <button
                        onClick={handleContinue}
                        disabled={saving}
                        style={{
                            background: '#003322', border: '1px solid #00ff88', color: '#00ff88',
                            borderRadius: 8, padding: '10px 24px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontFamily: 'monospace', fontSize: 13, opacity: saving ? 0.6 : 1,
                        }}
                    >
                        {saving ? 'Saving...' : 'To the mission map ▶'}
                    </button>
                </div>
            </div>
        )
    }

    // ── One-question-at-a-time screen ────────────────────────────
    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 8 }}>FIELD AGENT INTAKE</div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#00ff88', fontFamily: 'monospace', marginBottom: 6 }}>Placement assessment</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          Question {index + 1} / {questions.length}
        </span>
                <div style={{ flex: 1, height: 4, background: '#1a2a45', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${((index + 1) / questions.length) * 100}%`,
                        background: '#00ff88', borderRadius: 99, transition: 'width 0.3s',
                    }} />
                </div>
            </div>

            <div style={{ background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 13, color: '#c8daf0', fontFamily: 'monospace', lineHeight: 1.7, marginBottom: '0.9rem' }}>
                    {current.prompt}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {current.choices.map((choice, ci) => {
                        const selected = answers[current.id] === ci
                        return (
                            <button
                                key={ci}
                                onClick={() => selectChoice(ci)}
                                style={{
                                    textAlign: 'left', background: '#080c17',
                                    border: `1px solid ${selected ? '#00ff88' : '#1a2a45'}`,
                                    borderRadius: 8, padding: '9px 14px',
                                    color: selected ? '#00ff88' : '#8aaccf',
                                    fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', lineHeight: 1.6,
                                }}
                            >
                                {choice}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '2rem' }}>
                {index > 0 && (
                    <button
                        onClick={handleBack}
                        style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
                    >
                        ← Back
                    </button>
                )}

                <button
                    onClick={isLast ? handleSubmit : handleNext}
                    disabled={!isAnswered}
                    style={{
                        background: isAnswered ? '#003322' : '#0d1526',
                        border: `1px solid ${isAnswered ? '#00ff88' : '#1a2a45'}`,
                        color: isAnswered ? '#00ff88' : '#2a3a55',
                        borderRadius: 8, padding: '10px 24px',
                        cursor: isAnswered ? 'pointer' : 'not-allowed',
                        fontFamily: 'monospace', fontSize: 13,
                    }}
                >
                    {isLast ? 'Submit answers' : 'Next →'}
                </button>

                {!isAnswered && (
                    <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace' }}> Select an answer to continue</span>
                )}

                <div style={{ flex: 1 }} />
                <button
                    onClick={handleSkip}
                    disabled={saving}
                    style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '6px 14px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}
                >
                    Skip Placement →
                </button>
            </div>
        </div>
    )
}