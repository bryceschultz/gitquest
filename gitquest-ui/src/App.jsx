import { useEffect, useState } from 'react'
import './App.css'
import WelcomeScreen from './components/WelcomeScreen'
import MissionMap from './components/MissionMap'
import TrainingPage from './components/TrainingPage'
import Arsenal from './components/Arsenal'
import TrophyRoom from './components/TrophyRoom'
import PlacementQuiz from './components/PlacementQuiz'
import AuthPage from './components/AuthPage'
import { apiEnabled, me, signOut } from './api'
import { ProgressProvider } from './context/ProgressContext'
import { useProgress } from './context/useProgress'

const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
}

// Screen routing lives inside the provider so mode selection can be
// persisted into shared progress state (S3-02: onboarding mode is real,
// not just a visual choice).
function AppShell() {
  const { setMode, setCurrent, progress, agent, adoptAgent } = useProgress()
  // In the dynamic (API) build, the first screen offers an optional sign-in;
  // the static build starts at 'welcome' and never shows auth at all.
  const [screen, setScreen] = useState(apiEnabled() ? 'auth' : 'welcome') // 'auth' | 'welcome' | 'placement' | 'map' | 'training' | 'arsenal' | 'trophy'
  const [activeLevel, setActiveLevel] = useState(null) // { levelId, questId }

  // Returning session: adopt the agent from the auth cookie, then skip
  // straight past the auth screen.
  useEffect(() => {
    if (!apiEnabled()) return
    me().then(a => { if (a) { adoptAgent(a); setScreen('welcome') } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    try { await signOut() } catch { /* offline is fine */ }
    adoptAgent(null)
    setScreen('auth')
  }

  const handleModeSelect = (mode) => {
    setMode(mode)
    // Field agents without a stored placement result take (or skip) the
    // placement assessment; new recruits go straight to the guided map.
    if (mode === 'vet' && !progress.placement) {
      setScreen('placement')
    } else {
      setScreen('map')
    }
  }

  const openLevel = (levelId, questId) => {
    setActiveLevel({ levelId, questId })
    setCurrent(questId, levelId)
    setScreen('training')
  }

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', width: '100%', position: 'relative', fontFamily: 'monospace' }}>
      <div style={{ position: 'fixed', inset: 0, ...GRID_STYLE, pointerEvents: 'none' }} />

      {screen === 'auth' && <AuthPage onDone={() => setScreen('welcome')} />}
      {screen === 'welcome' && (
        <>
          <WelcomeScreen onSelect={handleModeSelect} />
          {apiEnabled() && (
            <div style={{ position: 'fixed', top: 10, right: 14, fontFamily: 'monospace', fontSize: 11, color: '#4a6fa5', zIndex: 30 }}>
              {agent ? (
                <span>◎ {agent.codename} · <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', padding: 0, fontSize: 11, fontFamily: 'monospace', textDecoration: 'underline' }}>sign out</button></span>
              ) : (
                <button onClick={() => setScreen('auth')} style={{ background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', padding: 0, fontSize: 11, fontFamily: 'monospace', textDecoration: 'underline' }}>◎ sign in</button>
              )}
            </div>
          )}
        </>
      )}
      {screen === 'placement' && <PlacementQuiz onDone={() => setScreen('map')} />}
      {screen === 'map' &&
        <MissionMap
          onBack={() => setScreen('welcome')}
          onOpenArsenal={() => setScreen('arsenal')}
          onOpenTrophy={() => setScreen('trophy')}
          onStartLevel={openLevel} />}
      {screen === 'training' && activeLevel && (
        <TrainingPage
          key={activeLevel.levelId}
          levelId={activeLevel.levelId}
          questId={activeLevel.questId}
          onBack={() => setScreen('map')}
          onComplete={() => setScreen('map')}
          onNextLevel={(levelId, questId) => openLevel(levelId, questId)}
        />)}
      {screen === 'arsenal' && <Arsenal onBack={() => setScreen('map')} />}
      {screen === 'trophy' && <TrophyRoom onBack={() => setScreen('map')} />}
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <style>{`
        @keyframes sb-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        body { margin: 0; background: #0a0e1a; }
      `}</style>
      <AppShell />
    </ProgressProvider>
  )
}
