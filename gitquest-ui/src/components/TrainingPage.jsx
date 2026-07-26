import { useState, useEffect, useRef } from 'react'
import { useProgress } from '../context/ProgressContext'

const BASE_URL = 'http://localhost:5001/api'
const COINS_PER_MISSION = 10

const RARITY_COLORS = {
    common:    '#4a6fa5',
    uncommon:  '#00cc66',
    rare:      '#9a6fcf',
    legendary: '#e4a020',
}

// ── Trophy Toast ──────────────────────────────────────────────
function TrophyToast({ trophies, onDone }) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (index >= trophies.length) { onDone(); return }
        const t = setTimeout(() => setIndex(i => i + 1), 3000)
        return () => clearTimeout(t)
    }, [index, trophies.length, onDone])

    if (index >= trophies.length) return null
    const t   = trophies[index]
    const col = RARITY_COLORS[t.rarity] || '#4a6fa5'

    return (
        <div style={{
            position: 'fixed', top: '4.5rem', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            background: '#0d1526',
            border: `1px solid ${col}44`,
            borderLeft: `3px solid ${col}`,
            borderRadius: 8, padding: '12px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'monospace', fontSize: 13,
            animation: 'fadeInUp 0.3s ease',
            boxShadow: `0 0 24px ${col}22`,
            minWidth: 280,
        }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <div>
                <div style={{ fontSize: 10, color: col, letterSpacing: '0.1em', marginBottom: 3 }}>
                    🏆 TROPHY UNLOCKED
                </div>
                <div style={{ color: '#c8daf0', fontWeight: 'bold' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#4a6fa5', marginTop: 2 }}>{t.description}</div>
            </div>
        </div>
    )
}

// ── Coin Toast ────────────────────────────────────────────────
function CoinToast({ coins }) {
    return (
        <div style={{
            position: 'fixed', top: '4.5rem', right: '1rem', zIndex: 200,
            background: '#0d1526', border: '1px solid #ffb70066',
            borderRadius: 8, padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'monospace', fontSize: 13,
            animation: 'fadeInUp 0.3s ease',
            boxShadow: '0 0 20px rgba(255,183,0,0.15)',
        }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{ color: '#ffb700', fontWeight: 'bold' }}>+{coins} coins</span>
            <span style={{ color: '#4a6fa5', fontSize: 11 }}>earned</span>
        </div>
    )
}

// ── Confirm Modal ─────────────────────────────────────────────
function ConfirmModal({ onStay, onLeave }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(4,8,16,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
        }}>
            <div style={{
                background: '#0d1526',
                border: '1px solid #e24b4a44',
                borderTop: '3px solid #e24b4a',
                borderRadius: 12, padding: '2rem',
                width: '100%', maxWidth: 380,
                textAlign: 'center',
            }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#c8daf0', marginBottom: 8 }}>
                    ABORT MISSION?
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a6fa5', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    Your current mission progress will not be saved.<br />
                    Are you sure you want to return to HQ?
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={onStay} style={{ background: '#003322', border: '1px solid #00ff88', color: '#00ff88', borderRadius: 8, padding: '10px 24px', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}>
                        ▶ Stay on Mission
                    </button>
                    <button onClick={onLeave} style={{ background: 'transparent', border: '1px solid #e24b4a44', color: '#e24b4a', borderRadius: 8, padding: '10px 24px', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer' }}>
                        ✕ Return to HQ
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Battle Section ────────────────────────────────────────────
function BattleSection({ battle, command, onComplete, onBattleStart }) {
    const [input, setInput]         = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [correct, setCorrect]     = useState(false)
    const [attempts, setAttempts]   = useState(0)
    const [showHint, setShowHint]   = useState(false)
    const [started, setStarted]     = useState(false)

    if (!command) return null

    function validate(input) {
        try {
            const pattern = new RegExp(command.validPattern, command.caseSensitive ? '' : 'i')
            return pattern.test(input.trim())
        } catch {
            return input.trim() === command.command
        }
    }

    const handleSubmit = () => {
        const isCorrect   = validate(input)
        const newAttempts = attempts + 1
        setCorrect(isCorrect)
        setSubmitted(true)
        setAttempts(newAttempts)
        if (isCorrect) {
            setTimeout(() => onComplete(newAttempts, showHint), 1200)
        }
    }

    const handleRetry = () => {
        setInput('')
        setSubmitted(false)
        if (attempts >= 1) setShowHint(true)
    }

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #1a2a45', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <span style={{ fontSize: 10, color: '#e24b4a', letterSpacing: '0.15em', fontFamily: 'monospace', border: '1px solid #e24b4a44', borderRadius: 4, padding: '3px 8px' }}>BATTLE</span>
                <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace' }}>FIELD SCENARIO</span>
            </div>

            <div style={{ background: '#080c17', border: '1px solid #e24b4a33', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: 13, color: '#c8daf0', lineHeight: 1.7, fontFamily: 'monospace' }}>
                <span style={{ color: '#e24b4a' }}>OBJECTIVE: </span>{battle.scenario}
            </div>

            {showHint && (
                <div style={{ background: '#0d1f15', border: '1px solid #00ff8833', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 12, color: '#00cc66', fontFamily: 'monospace' }}>
                    💡 HINT: {command.hint}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#00ff8877', fontFamily: 'monospace', fontSize: 14 }}>$</span>
                <input
                    value={input}
                    onChange={e => {
                        setInput(e.target.value)
                        if (!started && onBattleStart) {
                            onBattleStart()
                            setStarted(true)
                        }
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') submitted && !correct ? handleRetry() : handleSubmit() }}
                    disabled={submitted && correct}
                    placeholder="enter git command..."
                    style={{
                        flex: 1, background: '#040810',
                        border: `1px solid ${submitted ? (correct ? '#00ff88' : '#e24b4a') : '#1a2a45'}`,
                        borderRadius: 8, padding: '10px 14px',
                        color: '#c8daf0', fontFamily: 'monospace', fontSize: 13, outline: 'none',
                    }}
                />
                <button
                    onClick={submitted && !correct ? handleRetry : handleSubmit}
                    disabled={!input.trim()}
                    style={{
                        background: '#003322', border: '1px solid #00ff88',
                        color: '#00ff88', borderRadius: 8, padding: '10px 20px',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        fontFamily: 'monospace', fontSize: 13,
                        opacity: input.trim() ? 1 : 0.4,
                    }}
                >
                    {submitted && !correct ? 'Retry' : 'Execute'}
                </button>
            </div>

            {submitted && (
                <div style={{ marginTop: 10, fontSize: 12, fontFamily: 'monospace', color: correct ? '#00ff88' : '#e24b4a' }}>
                    {correct
                        ? '✓ COMMAND ACCEPTED — mission objective secured'
                        : `✗ REJECTED — ${attempts > 1 ? 'check your syntax carefully' : 'try again'}`}
                </div>
            )}
        </div>
    )
}

// ── Training Page ─────────────────────────────────────────────
export default function TrainingPage({ missionId, levelId, allMissions = [], onBack, onComplete }) {
    const { completeLevel, addCoins, addXP }   = useProgress()
    const [mission, setMission]         = useState(null)
    const [command, setCommand]         = useState(null)
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState(null)
    const [battleDone, setBattleDone]   = useState(false)
    const [showModal, setShowModal]     = useState(false)
    const [showToast, setShowToast]     = useState(false)
    const [levelNumber, setLevelNumber] = useState(null)
    const [newTrophies, setNewTrophies] = useState([])
    const [skippedTraining, setSkippedTraining] = useState(false)

    const sessionMissionCountRef = useRef(
        parseInt(sessionStorage.getItem('sessionMissions') || '0')
    )
    const battleStartRef = useRef(null)

    // Reset state when mission changes
    useEffect(() => {
        setBattleDone(false)
        setSkippedTraining(false)
        battleStartRef.current = null
    }, [missionId])

    // Load mission data
    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                setError(null)
                const [cmdRes, allRes, lvlRes] = await Promise.all([
                    fetch(`${BASE_URL}/missions/${missionId}/command`, { credentials: 'include' }),
                    fetch(`${BASE_URL}/missions`, { credentials: 'include' }),
                    fetch(`${BASE_URL}/levels`,   { credentials: 'include' }),
                ])
                if (!cmdRes.ok) throw new Error('Failed to load mission command')
                const { command: cmd } = await cmdRes.json()
                setCommand(cmd)
                const { missions } = await allRes.json()
                const found = missions.find(m => m._id === missionId)
                if (!found) throw new Error('Mission not found')
                setMission(found)
                const { levels } = await lvlRes.json()
                const foundLevel = levels.find(l => l._id === levelId)
                if (foundLevel) setLevelNumber(foundLevel.levelNumber)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [missionId, levelId])

    // ── onMissionComplete ───────────────────────────────────────
    async function handleMissionComplete(attempts, hintUsed) {
        completeLevel(missionId)
        if (typeof addCoins === 'function') addCoins(COINS_PER_MISSION) // 10 XP per mission
        if (typeof addXP === 'function')   addXP(20)   // 20 XP per mission
        // Save battle record to DB
        try {
            await fetch(`${BASE_URL}/battles/complete`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    missionId,
                    commandId: command._id,
                    attempts,
                    hintUsed,
                    passed:        true,
                    xpEarned:      10,
                    coinsEarned:   COINS_PER_MISSION,
                }),
            })
        } catch (err) {
            console.error('Failed to save battle:', err)
        }

        // Update session mission count
        const newCount = sessionMissionCountRef.current + 1
        sessionMissionCountRef.current = newCount
        sessionStorage.setItem('sessionMissions', String(newCount))

        // Calculate battle duration
        const durationSeconds = battleStartRef.current
            ? Math.round((Date.now() - battleStartRef.current) / 1000)
            : null

        // Show coin toast
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)

        // Evaluate trophies
        try {
            const res = await fetch(`${BASE_URL}/trophies/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    missionId,
                    attempts,
                    hintUsed,
                    skippedTraining,
                    durationSeconds,
                    sessionMissionCount: newCount,
                }),
            })
            const data = await res.json()
            if (data.newlyUnlocked?.length > 0) {
                setNewTrophies(data.newlyUnlocked)
            }
        } catch (err) {
            console.error('Trophy evaluation failed:', err)
        }

        // Advance to next mission
        setBattleDone(true)
        const sorted     = [...allMissions].sort((a, b) => a.missionNumber - b.missionNumber)
        const currentIdx = sorted.findIndex(m => m._id === missionId)
        const next       = sorted[currentIdx + 1]

        setTimeout(() => {
            setBattleDone(false)
            if (next) onComplete(next._id, levelId, allMissions)
            else      onComplete(null, null, null)
        }, 2000)
    }

    // ── Loading / Error states ──────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#4a6fa5', fontFamily: 'monospace' }}>
                <div style={{ color: '#00ff88', marginBottom: 8 }}>◈ LOADING MISSION DATA...</div>
                <div style={{ fontSize: 11, color: '#2a3a55' }}>Connecting to HQ database</div>
            </div>
        )
    }

    if (error || !mission) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#4a6fa5', fontFamily: 'monospace' }}>
                <div style={{ color: '#e24b4a', marginBottom: 8 }}>✘ {error || 'Mission data not found'}</div>
                <button onClick={onBack} style={{ marginTop: 16, color: '#00ff88', background: 'none', border: '1px solid #00ff8844', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace' }}>
                    ← Back
                </button>
            </div>
        )
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

            {/* Coin toast */}
            {showToast && <CoinToast coins={COINS_PER_MISSION} />}

            {/* Trophy toast queue */}
            {newTrophies.length > 0 && (
                <TrophyToast
                    trophies={newTrophies}
                    onDone={() => setNewTrophies([])}
                />
            )}

            {/* Confirm modal */}
            {showModal && (
                <ConfirmModal
                    onStay={() => setShowModal(false)}
                    onLeave={() => { setShowModal(false); onBack() }}
                />
            )}

            {/* Topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                    ← Back
                </button>
                <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace' }}>Level {levelNumber ?? '—'}</span>
                <span style={{ color: '#2a3a55', fontFamily: 'monospace' }}>/</span>
                <span style={{ fontSize: 11, color: '#00ff88', fontFamily: 'monospace' }}>{mission.title}</span>

                <div style={{ flex: 1 }} />

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
                    <div style={{ flex: 1, height: 4, background: '#1a2a45', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${allMissions.length > 0
                                ? ((allMissions.findIndex(m => m._id === missionId) + 1) / allMissions.length) * 100
                                : 0}%`,
                            background: '#00ff88', borderRadius: 99, transition: 'width 0.4s',
                        }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#4a6fa5', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {allMissions.findIndex(m => m._id === missionId) + 1}/{allMissions.length}
          </span>
                </div>

                {/* Home button */}
                <button
                    onClick={() => setShowModal(true)}
                    style={{ fontSize: 11, color: '#00ff88', background: '#003322', border: '1px solid #00ff8844', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.06em' }}
                >
                    ⌂ Home
                </button>

                {/* Skip to battle */}
                <button
                    onClick={() => {
                        setSkippedTraining(true)
                        setTimeout(() => document.getElementById('battle-section')?.scrollIntoView({ behavior: 'smooth' }), 50)
                    }}
                    style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                    Skip to the Battle ↓
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Mission header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 8 }}>TRAINING MODULE</div>
                    <h1 style={{ fontSize: 24, fontWeight: 500, color: '#00ff88', fontFamily: 'monospace', marginBottom: 4 }}>{mission.title}</h1>
                    <div style={{ background: '#080c17', border: '1px solid #1a2a45', borderLeft: '3px solid #00ff8844', borderRadius: 8, padding: '1rem 1.25rem', fontSize: 13, color: '#8aaccf', lineHeight: 1.8, fontFamily: 'monospace', marginTop: '1rem' }}>
                        <span style={{ color: '#4a6fa5', fontSize: 10, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>HANDLER BRIEFING</span>
                        {mission.story}
                    </div>
                </div>

                {/* Command explainer */}
                {command && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: 11, color: '#00ff8888', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>THE COMMAND</div>
                        <div style={{ background: '#040810', border: '1px solid #1a2a45', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#00ff88' }}>$ {command.command}</div>
                        </div>
                        <div style={{ background: '#080c17', border: '1px solid #1a2a45', borderRadius: 8, padding: '1rem 1.25rem', fontSize: 13, color: '#8aaccf', lineHeight: 1.8, fontFamily: 'monospace' }}>
                            <span style={{ color: '#4a6fa5', fontSize: 10, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>EXPLAINER</span>
                            {command.explainer}
                        </div>
                    </div>
                )}

                {/* Field assessment divider */}
                <div id="battle-section" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#1a2a45' }} />
                    <span style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', letterSpacing: '0.15em' }}>FIELD ASSESSMENT</span>
                    <div style={{ flex: 1, height: 1, background: '#1a2a45' }} />
                </div>

                {/* Battle / completion */}
                {battleDone ? (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #00ff8844', borderRadius: 12, background: '#0d1f15' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#00ff88', marginBottom: 4 }}>OBJECTIVE SECURED</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#4a6fa5' }}>Loading next mission...</div>
                    </div>
                ) : (
                    <BattleSection
                        battle={mission}
                        command={command}
                        onBattleStart={() => { battleStartRef.current = Date.now() }}
                        onComplete={handleMissionComplete}
                    />
                )}

                <div style={{ height: '3rem' }} />
            </div>

            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}