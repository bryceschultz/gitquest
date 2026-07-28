import { useEffect, useRef, useState } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import PlacementQuiz from './components/PlacementQuiz'
import MissionMap from './components/MissionMap'
import TrainingPage from './components/TrainingPage'
import TrophyRoom from './components/TrophyRoom'
import Arsenal from './components/Arsenal'
import Leaderboard from './components/Leaderboard'
import SignInPage from './components/SignInPage'
import SignUpPage from './components/SignUpPage'
import { ProgressProvider, useProgress } from './context/ProgressContext'

const GRID_STYLE = {
    backgroundImage:
        'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
}

const AUDIO_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, '') + '/audio/1.7_1-consumatesurvivor.caf.wav' // const AUDIO_URL = 'http://localhost:5001/audio/Trent Reznor - Intriguing Possibilities.wav'
const BASE_URL = import.meta.env.VITE_API_URL // const BASE_URL  = 'http://localhost:5001/api'

/**
 * @returns {JSX.Element}
 * @constructor
 */
function AppInner() {
    const { progress, reloadProgress, resetProgress, loadCoins, loadXP } = useProgress()
    const [screen, setScreen]           = useState('signin')
    const [activeLevel, setActiveLevel] = useState(null)
    const [agent, setAgent]             = useState(null)
    const [soundOn, setSoundOn]         = useState(true)
    const [sessionChecked, setSessionChecked] = useState(false)
    const audioRef                      = useRef(null)

    // ── Restore session on page load/refresh ──────────────────
    useEffect(() => {
        async function restoreSession() {
            try {
                const res = await fetch(`${BASE_URL}/auth/me`, {
                    credentials: 'include',
                })
                if (res.ok) {
                    const { agent: agentData } = await res.json()
                    setAgent(agentData)
                    loadCoins(agentData.coins ?? 0)
                    loadXP(agentData.totalXP ?? 0)
                    await reloadProgress()
                    setScreen('welcome')
                }
            } catch (err) {
                console.error('Session restore failed:', err)
            } finally {
                setSessionChecked(true)
            }
        }
        restoreSession()
    }, [])

    // Initialize audio once
    useEffect(() => {
        const audio      = new Audio(AUDIO_URL)
        audio.loop       = true
        audio.volume     = 0.5
        audioRef.current = audio
        return () => { audio.pause(); audio.src = '' }
    }, [])

    // Play on map/training/arsenal/trophy, pause on auth + welcome + placement
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        const shouldPlay = !['signin', 'signup', 'welcome', 'placement'].includes(screen)
        if (shouldPlay && soundOn) {
            audio.play().catch(() => {})
        } else {
            audio.pause()
        }
    }, [screen, soundOn])

    /**
     * @param {object} agentData
     */
    async function handleSignIn(agentData) {
        setAgent(agentData)
        loadCoins(agentData.coins ?? 0)
        loadXP(agentData.totalXP ?? 0)
        await reloadProgress()
        setScreen('welcome')
    }

    /**
     * @param {object} agentData
     */
    async function handleSignUp(agentData) {
        setAgent(agentData)
        loadCoins(agentData.coins ?? 0)
        loadXP(agentData.totalXP ?? 0)
        await reloadProgress()
        setScreen('welcome')
    }

    /**
     * Called by WelcomeScreen after its 2-second delay
     */
    async function handleLogout() {
        try {
            await fetch(`${BASE_URL}/auth/signout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (err) {
            console.error('Logout failed:', err)
        }
        resetProgress()
        sessionStorage.removeItem('sessionMissions')
        setAgent(null)
        setActiveLevel(null)
        setScreen('signin')
    }

    /**
     */
    function toggleSound() {
        setSoundOn(prev => !prev)
    }

    // ── Don't render anything until session check is done ─────
    if (!sessionChecked) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
                background: '#0a0e1a', fontFamily: 'monospace',
            }}>
                <div style={{ color: '#00ff88', marginBottom: 8, fontSize: 14 }}>
                    ◈ INITIALIZING SECURE CHANNEL...
                </div>
                <div style={{ color: '#2a3a55', fontSize: 11 }}>
                    Verifying agent credentials
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: '#0a0e1a', minHeight: '100vh', width: '100%', position: 'relative', fontFamily: 'monospace' }}>
            <div style={{ position: 'fixed', inset: 0, ...GRID_STYLE, pointerEvents: 'none' }} />

            {/* Sound button — hidden on auth + welcome + placement */}
            {screen !== 'signin' && screen !== 'signup' && screen !== 'welcome' && screen !== 'placement' && (
                <button
                    onClick={toggleSound}
                    style={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: soundOn ? '#00ff88' : '#4a6fa5', background: '#0d1526', border: `1px solid ${soundOn ? '#00ff8844' : '#1a2a45'}`, borderRadius: 99, padding: '6px 14px', cursor: 'pointer', zIndex: 100, fontFamily: 'monospace' }}
                >
                    {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
                </button>
            )}

            {/* Agent badge */}
            {agent && screen !== 'signin' && screen !== 'signup' && screen !== 'placement' && (
                <div style={{ position: 'fixed', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#00ff88', background: '#0d1526', border: '1px solid #00ff8844', borderRadius: 99, padding: '6px 14px', zIndex: 100, fontFamily: 'monospace' }}>
                    ◈ {agent.codename}
                    <span style={{ color: '#4a6fa5' }}>·</span>
                    <span style={{ color: '#9a6fcf' }}>⚡ {progress.totalXP ?? 0} XP</span>
                </div>
            )}

            {screen === 'signin'  && <SignInPage  onSignIn={handleSignIn}  onGoToSignUp={() => setScreen('signup')} />}
            {screen === 'signup'  && <SignUpPage  onSignUp={handleSignUp}  onGoToSignIn={() => setScreen('signin')} />}
            {screen === 'welcome' && (
                <WelcomeScreen
                    onSelect={(choice) => setScreen(choice === 'vet' ? 'placement' : 'map')}
                    onLogout={handleLogout}
                />
            )}
            {screen === 'placement' && (
                <PlacementQuiz onDone={() => setScreen('map')} />
            )}
            {screen === 'leaderboard' && (<Leaderboard agent={agent} onBack={() => setScreen('map')} />)}

            {screen === 'map' && (
                <MissionMap
                    agent={agent}
                    onBack={() => setScreen('welcome')}
                    onOpenTrophy={() => setScreen('trophy')}
                    onOpenArsenal={() => setScreen('arsenal')}
                    onOpenLeaderboard={() => setScreen('leaderboard')}
                    onStartLevel={(missionId, levelId, allMissions) => {
                        setActiveLevel({ missionId, levelId, allMissions })
                        setScreen('training')
                    }}
                />
            )}

            {screen === 'training' && activeLevel && (
                <TrainingPage
                    missionId={activeLevel.missionId}
                    levelId={activeLevel.levelId}
                    allMissions={activeLevel.allMissions}
                    onBack={() => setScreen('map')}
                    onComplete={(nextMissionId, nextLevelId, allMissions) => {
                        if (nextMissionId) {
                            setActiveLevel({ missionId: nextMissionId, levelId: nextLevelId, allMissions })
                        } else {
                            setScreen('map')
                        }
                    }}
                />
            )}

            {screen === 'arsenal' && <Arsenal    onBack={() => setScreen('map')} coins={progress.coins ?? 0} />}
            {screen === 'trophy'  && <TrophyRoom onBack={() => setScreen('map')} />}
        </div>
    )
}

/**
 * @returns {JSX.Element}
 * @constructor
 */
export default function App() {
    return (
        <ProgressProvider>
            <style>{`
        @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        body { margin: 0; background: #0a0e1a; }
      `}</style>
            <AppInner />
        </ProgressProvider>
    )
}