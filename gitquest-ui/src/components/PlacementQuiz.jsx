import { useState } from 'react'
import { getPlacementSet, scorePlacement, PLACEMENT_THRESHOLD } from '../data/placement'

const BASE_URL = import.meta.env.VITE_API_URL // const BASE_URL = 'http://localhost:5001/api'

// Placement assessment for the Field Agent route (FR-06, S3-02).
// A random subset of PLACEMENT_QUESTION_BANK is drawn once per attempt.
// Scored multiple-choice; ≥75% recommends starting at Level 2.
// Wrong answers get an explanation after submission. Skippable — field
// agents keep free navigation either way; the result is only ever a
// recommendation, saved to the agent's profile for reference.
export default function PlacementQuiz({ onDone }) {
    const [questions]         = useState(() => getPlacementSet())
    const [answers, setAnswers] = useState({})
    const [result, setResult]   = useState(null)
    const [levelTitle, setLevelTitle] = useState(null)
    const [saving, setSaving]   = useState(false)
    const [saveError, setSaveError] = useState(null)

    const allAnswered = questions.every(q => answers[q.id] !== undefined)

    async function handleSubmit() {
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

        setSaving(true)
        setSaveError(null)
        try {
            const res = await fetch(`${BASE_URL}/agents/placement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    recommendedLevel: r.recommendedLevel,
                    pct:               r.pct,
                    correct:           r.correct,
                    total:             r.total,
                    passed:            r.passed,
                }),
            })
            if (!res.ok) throw new Error('Failed to save placement result')
        } catch (err) {
            setSaveError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 8 }}>FIELD AGENT INTAKE</div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#00ff88', fontFamily: 'monospace', marginBottom: 6 }}>Placement assessment</h1>
            <p style={{ fontSize: 13, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.7, marginBottom: '2rem' }}>
                {questions.length} questions. Score {Math.round(PLACEMENT_THRESHOLD * 100)}% or higher and HQ recommends you start at Level 2.
                As a field agent every mission is open to you regardless — this just tells you where to begin.
            </p>

            {questions.map((q, qi) => {
                const chosen = answers[q.id]
                const showResult = result !== null
                const isCorrect = chosen === q.answer
                return (
                    <div key={q.id} style={{ marginBottom: '1.75rem', background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 10, padding: '1.25rem' }}>
                        <div style={{ fontSize: 13, color: '#c8daf0', fontFamily: 'monospace', lineHeight: 1.7, marginBottom: '0.9rem' }}>
                            <span style={{ color: '#4a6fa5' }}>Q{qi + 1}. </span>{q.prompt}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {q.choices.map((choice, ci) => {
                                const selected = chosen === ci
                                let border = selected ? '#00ff88' : '#1a2a45'
                                let color = selected ? '#00ff88' : '#8aaccf'
                                if (showResult) {
                                    if (ci === q.answer) { border = '#00ff88'; color = '#00ff88' }
                                    else if (selected) { border = '#e24b4a'; color = '#e24b4a' }
                                    else { color = '#4a6fa5' }
                                }
                                return (
                                    <button
                                        key={ci}
                                        onClick={() => !showResult && setAnswers(a => ({ ...a, [q.id]: ci }))}
                                        disabled={showResult}
                                        style={{
                                            textAlign: 'left', background: '#080c17', border: `1px solid ${border}`,
                                            borderRadius: 8, padding: '9px 14px', color, fontFamily: 'monospace',
                                            fontSize: 12, cursor: showResult ? 'default' : 'pointer', lineHeight: 1.6,
                                        }}
                                    >
                                        {choice}
                                    </button>
                                )
                            })}
                        </div>
                        {showResult && !isCorrect && (
                            <div style={{ marginTop: 10, fontSize: 12, color: '#e4a020', fontFamily: 'monospace', lineHeight: 1.7, background: '#1a1005', border: '1px solid #a0600033', borderRadius: 8, padding: '10px 14px' }}>
                                WHY: {q.explanation}
                            </div>
                        )}
                    </div>
                )
            })}

            {result ? (
                <div style={{ textAlign: 'center', border: '1px solid #00ff8844', borderRadius: 12, background: '#0d1f15', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#00ff88', marginBottom: 6 }}>
                        {result.correct} / {result.total} — {result.pct}%
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#c8daf0', marginBottom: '0.75rem', lineHeight: 1.7 }}>
                        {result.passed
                            ? `Cleared the ${Math.round(PLACEMENT_THRESHOLD * 100)}% threshold. Recommended start: Level ${result.recommendedLevel}${levelTitle ? ` — ${levelTitle}` : ''}.`
                            : `Below the ${Math.round(PLACEMENT_THRESHOLD * 100)}% threshold. Recommended start: Level ${result.recommendedLevel}${levelTitle ? ` — ${levelTitle}` : ''}. All missions remain open to you.`}
                    </div>
                    {saveError && (
                        <div style={{ fontSize: 11, color: '#e24b4a', fontFamily: 'monospace', marginBottom: '1rem' }}>
                            ✘ Couldn't save your result to HQ records — you can still continue.
                        </div>
                    )}
                    <button
                        onClick={onDone}
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
            ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        style={{
                            background: allAnswered ? '#003322' : '#0d1526',
                            border: `1px solid ${allAnswered ? '#00ff88' : '#1a2a45'}`,
                            color: allAnswered ? '#00ff88' : '#2a3a55',
                            borderRadius: 8, padding: '10px 24px',
                            cursor: allAnswered ? 'pointer' : 'not-allowed',
                            fontFamily: 'monospace', fontSize: 13,
                        }}
                    >
                        Submit answers
                    </button>
                    {!allAnswered && (
                        <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace' }}>answer all questions to submit</span>
                    )}
                    <div style={{ flex: 1 }} />
                    <button onClick={onDone} style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace' }}>
                        skip placement →
                    </button>
                </div>
            )}
        </div>
    )
}