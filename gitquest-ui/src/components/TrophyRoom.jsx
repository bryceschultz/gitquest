import { useState, useEffect } from 'react'

//const BASE_URL = import.meta.env.VITE_API_URL
const BASE_URL = 'http://localhost:5001/api'

const RARITY = {
  common:    { label: 'COMMON',    color: '#4a6fa5', border: '#1a2a45',    bg: '#0a1220' },
  uncommon:  { label: 'UNCOMMON',  color: '#00cc66', border: '#00ff8833',  bg: '#0d1f15' },
  rare:      { label: 'RARE',      color: '#9a6fcf', border: '#4a2a8a44',  bg: '#110d1f' },
  legendary: { label: 'LEGENDARY', color: '#e4a020', border: '#a0600033',  bg: '#1a1005' },
}

/**
 *
 * @param param0
 * @param param0.onBack
 * @returns {JSX.Element}
 * @constructor
 */
export default function TrophyRoom({ onBack }) {
  const [trophies, setTrophies] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [trRes, stRes] = await Promise.all([
          fetch(`${BASE_URL}/trophies`, { credentials: 'include' }),
          fetch(`${BASE_URL}/stats`,    { credentials: 'include' }),
        ])
        const { trophies: t } = await trRes.json()
        const { stats: s }    = await stRes.json()
        setTrophies(t)
        setStats(s)
      } catch (err) {
        console.error('Failed to load trophy room:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const earned = trophies.filter(t => t.earned)
  const locked = trophies.filter(t => !t.earned)

  if (loading) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#00ff88', fontFamily: 'monospace' }}>
          ◈ LOADING TROPHY ROOM...
        </div>
    )
  }

  return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
            ← Back
          </button>
          <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>TROPHY ROOM</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#00ff88', fontFamily: 'monospace' }}>
          {earned.length} / {trophies.length} UNLOCKED
        </span>
        </div>

        <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 6 }}>COMMENDATIONS</div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace', marginBottom: 6 }}>Trophy Room</h1>
            <p style={{ fontSize: 13, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.6 }}>
              A record of your field operations. Earn commendations by completing missions,
              winning battles, and mastering Git under pressure.
            </p>
          </div>

          {/* Agent stats */}
          {stats && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>AGENT DOSSIER</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {Object.entries(stats).map(([key, value]) => (
                      <div key={key} style={{ background: '#080c17', border: '1px solid #1a2a45', borderRadius: 8, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: 6 }}>
                          {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace' }}>{value}</div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>COMMENDATION PROGRESS</span>
              <span style={{ fontSize: 10, color: '#00ff88', fontFamily: 'monospace' }}>
              {trophies.length > 0 ? Math.round((earned.length / trophies.length) * 100) : 0}%
            </span>
            </div>
            <div style={{ height: 6, background: '#1a2a45', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${trophies.length > 0 ? (earned.length / trophies.length) * 100 : 0}%`,
                background: '#00ff88', borderRadius: 99, transition: 'width 0.5s',
              }} />
            </div>
          </div>

          {/* Earned trophies */}
          {earned.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: 10, color: '#00ff8888', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                  EARNED — {earned.length}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {earned.map(t => {
                    const r = RARITY[t.rarity]
                    return (
                        <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: r.bg, border: `1px solid ${r.border}`, borderRadius: 10, padding: '1rem 1.25rem' }}>
                          <span style={{ fontSize: 26, flexShrink: 0, width: 36, textAlign: 'center' }}>{t.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace' }}>{t.name}</span>
                              <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', color: r.color, border: `1px solid ${r.border}`, borderRadius: 4, padding: '2px 6px' }}>
                          {r.label}
                        </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.6 }}>{t.description}</div>
                          </div>
                          <div style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', flexShrink: 0, textAlign: 'right' }}>
                            {t.earnedAt ? new Date(t.earnedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                    )
                  })}
                </div>
              </div>
          )}

          {/* Locked trophies */}
          <div>
            <div style={{ fontSize: 10, color: '#2a3a55', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
              CLASSIFIED — {locked.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {locked.map(t => {
                const r = RARITY[t.rarity]
                return (
                    <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#080c17', border: '1px solid #1a2a45', borderRadius: 10, padding: '1rem 1.25rem', opacity: 0.5 }}>
                      <span style={{ fontSize: 26, flexShrink: 0, width: 36, textAlign: 'center', filter: 'grayscale(1)', opacity: 0.3 }}>{t.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#2a3a55', fontFamily: 'monospace' }}>{t.name}</span>
                          <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', color: '#2a3a55', border: '1px solid #1a2a45', borderRadius: 4, padding: '2px 6px' }}>
                        {r.label}
                      </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#2a3a55', fontFamily: 'monospace', lineHeight: 1.6 }}>{t.description}</div>
                      </div>
                      <span style={{ fontSize: 16, color: '#1a2a45', flexShrink: 0 }}>⬡</span>
                    </div>
                )
              })}
            </div>
          </div>

          <div style={{ height: '3rem' }} />
        </div>
      </div>
  )
}