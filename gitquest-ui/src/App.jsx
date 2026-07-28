import { useEffect, useRef, useState } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
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

const AUDIO_URL =
    import.meta.env.VITE_API_URL.replace(/\/api$/, '') +
    '/audio/1.7_1-consumatesurvivor.caf.wav'

const BASE_URL = import.meta.env.VITE_API_URL

function AppInner() {
    const { progress, reloadProgress, resetProgress, loadCoins, loadXP } = useProgress()

    const [screen, setScreen] = useState('signin')
    const [activeLevel, setActiveLevel] = useState(null)
    const [agent, setAgent] = useState(null)
    const [soundOn, setSoundOn] = useState(true)
    const [sessionChecked, setSessionChecked] = useState(false)

    const audioRef = useRef(null)

    // Restore session
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

    // Initialize audio
    useEffect(() => {
        const audio = new Audio(AUDIO_URL)

        audio.loop = true
        audio.volume = 0.5

        audioRef.current = audio

        return () => {
            audio.pause()
            audio.src = ''
        }
    }, [])

    // Control audio playback
    useEffect(() => {
        const audio = audioRef.current

        if (!audio) return

        const shouldPlay =
            !['signin', 'signup', 'welcome'].includes(screen)

        if (shouldPlay && soundOn) {
            audio.play().catch(() => {})
        } else {
            audio.pause()
        }
    }, [screen, soundOn])

    async function handleSignIn(agentData) {
        setAgent(agentData)
        loadCoins(agentData.coins ?? 0)
        loadXP(agentData.totalXP ?? 0)

        await reloadProgress()

        setScreen('welcome')
    }

    async function handleSignUp(agentData) {
        setAgent(agentData)
        loadCoins(agentData.coins ?? 0)
        loadXP(agentData.totalXP ?? 0)

        await reloadProgress()

        setScreen('welcome')
    }

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

    function toggleSound() {
        setSoundOn(prev => !prev)
    }

    // Wait for session check AFTER all hooks
    if (!sessionChecked) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a0e1a',
                    fontFamily: 'monospace',
                }}
            >
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
        <div
            style={{
                background: '#0a0e1a',
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                fontFamily: 'monospace',
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    ...GRID_STYLE,
                    pointerEvents: 'none',
                }}
            />

            {screen !== 'signin' &&
                screen !== 'signup' &&
                screen !== 'welcome' && (
                    <button
                        onClick={toggleSound}
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            right: '1rem',
                            zIndex: 100,
                        }}
                    >
                        {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
                    </button>
                )}

            {agent &&
                screen !== 'signin' &&
                screen !== 'signup' && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            left: '1rem',
                            zIndex: 100,
                            color: '#00ff88',
                        }}
                    >
                        ◈ {agent.codename} · ⚡ {progress.totalXP ?? 0} XP
                    </div>
                )}

            {screen === 'signin' && (
                <SignInPage
                    onSignIn={handleSignIn}
                    onGoToSignUp={() => setScreen('signup')}
                />
            )}

            {screen === 'signup' && (
                <SignUpPage
                    onSignUp={handleSignUp}
                    onGoToSignIn={() => setScreen('signin')}
                />
            )}

            {screen === 'welcome' && (
                <WelcomeScreen
                    onSelect={() => setScreen('map')}
                    onLogout={handleLogout}
                />
            )}

            {screen === 'leaderboard' && (
                <Leaderboard
                    agent={agent}
                    onBack={() => setScreen('map')}
                />
            )}

            {screen === 'map' && (
                <MissionMap
                    agent={agent}
                    onBack={() => setScreen('welcome')}
                    onOpenTrophy={() => setScreen('trophy')}
                    onOpenArsenal={() => setScreen('arsenal')}
                    onOpenLeaderboard={() => setScreen('leaderboard')}
                    onStartLevel={(missionId, levelId, allMissions) => {
                        setActiveLevel({
                            missionId,
                            levelId,
                            allMissions,
                        })

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
                            setActiveLevel({
                                missionId: nextMissionId,
                                levelId: nextLevelId,
                                allMissions,
                            })
                        } else {
                            setScreen('map')
                        }
                    }}
                />
            )}

            {screen === 'arsenal' && (
                <Arsenal
                    onBack={() => setScreen('map')}
                    coins={progress.coins ?? 0}
                />
            )}

            {screen === 'trophy' && (
                <TrophyRoom
                    onBack={() => setScreen('map')}
                />
            )}
        </div>
    )
}

export default function App() {
    return (
        <ProgressProvider>
            <style>{`
                @keyframes sb-pulse {
                    0%,100% { opacity:1 }
                    50% { opacity:0.3 }
                }

                body {
                    margin:0;
                    background:#0a0e1a;
                }
            `}</style>

            <AppInner />
        </ProgressProvider>
    )
}