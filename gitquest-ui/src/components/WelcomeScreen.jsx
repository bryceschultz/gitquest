import { useState } from 'react'

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
function PulseDot() {
    return (
        <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#00ff88',
            display: 'inline-block',
            animation: 'sb-pulse 1.5s infinite',
        }} />
    )
}

/**
 *
 * @param param0
 * @param param0.onSelect
 * @param param0.onLogout
 * @returns {JSX.Element}
 * @constructor
 */
function WelcomeScreen({ onSelect, onLogout }) {
    const [loggingOut, setLoggingOut] = useState(false)

    /**
     *
     * @returns {Promise<void>}
     */
    async function handleLogout() {
        setLoggingOut(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        onLogout()
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1, minHeight: '100vh' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.12em', color: '#00ff88', border: '1px solid #00ff8844', borderRadius: 4, padding: '5px 14px', marginBottom: '1.5rem' }}>
                <PulseDot /> LIVE THREAT DETECTED
            </div>

            <h1 style={{ fontSize: 38, fontWeight: 500, color: '#e8f4fd', textAlign: 'center', marginBottom: 8, fontFamily: 'monospace' }}>
                Git<span style={{ color: '#00ff88' }}>Quest</span>
            </h1>

            <p style={{ fontSize: 14, color: '#4a6fa5', textAlign: 'center', lineHeight: 1.7, maxWidth: 460, marginBottom: '2rem' }}>
                Learn git with hacker themed interactive lessons & quizzes
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 560, marginBottom: '1.5rem' }}>
                {[
                    { id: 'new', icon: '☰', title: 'New recruit', desc: 'Guided missions, unlocked in order. Learn Git through the operation.' },
                    { id: 'vet', icon: '🗺', title: 'Field agent', desc: 'Free roam — Jump to any mission. You know the tools.' },
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        disabled={loggingOut}
                        style={{ background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 10, padding: '1.25rem', cursor: loggingOut ? 'not-allowed' : 'pointer', textAlign: 'left', transition: 'border-color 0.2s', opacity: loggingOut ? 0.4 : 1 }}
                        onMouseEnter={e => { if (!loggingOut) e.currentTarget.style.borderColor = '#00ff88' }}
                        onMouseLeave={e => { if (!loggingOut) e.currentTarget.style.borderColor = '#1a2a45' }}
                    >
                        <div style={{ fontSize: 22, color: '#00ff88', marginBottom: 10 }}>{opt.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#c8daf0', marginBottom: 5 }}>{opt.title}</div>
                        <div style={{ fontSize: 12, color: '#4a6fa5', lineHeight: 1.5 }}>{opt.desc}</div>
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2a3a55', marginBottom: '2rem' }}>
                ℹ Clearance level saved between sessions
            </div>

            {/* Logout button */}
            <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                    position: 'absolute', bottom: '2rem',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, color: loggingOut ? '#4a6fa5' : '#e24b4a',
                    background: 'transparent',
                    border: `1px solid ${loggingOut ? '#1a2a45' : '#e24b4a44'}`,
                    borderRadius: 99, padding: '7px 20px',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    fontFamily: 'monospace',
                    letterSpacing: '0.06em',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                    if (!loggingOut) {
                        e.currentTarget.style.borderColor = '#e24b4a'
                        e.currentTarget.style.background  = '#e24b4a11'
                    }
                }}
                onMouseLeave={e => {
                    if (!loggingOut) {
                        e.currentTarget.style.borderColor = '#e24b4a44'
                        e.currentTarget.style.background  = 'transparent'
                    }
                }}
            >
                {loggingOut ? (
                    <>
                        <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: '#4a6fa5', display: 'inline-block',
                            animation: 'sb-pulse 1s infinite',
                        }} />
                        Logging out...
                    </>
                ) : '⏻ Log out'}
            </button>
        </div>
    )
}

export default WelcomeScreen