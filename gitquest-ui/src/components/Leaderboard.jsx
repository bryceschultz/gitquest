import { useState, useEffect } from 'react'

//const BASE_URL = import.meta.env.local.VITE_API_URL //
const BASE_URL = 'http://localhost:5001/api'

const RANK_COLORS = {
    1: '#e4a020',  // gold
    2: '#8aaccf',  // silver
    3: '#cd7f32',  // bronze
}

const RANK_ICONS = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
}

export default function Leaderboard({ onBack, agent }) {
    const [tab, setTab]               = useState('alltime')
    const [data, setData]             = useState([])
    const [levelNumber, setLevelNumber] = useState(null)
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState(null)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                setError(null)
                const res  = await fetch(`${BASE_URL}/agents/leaderboard?type=${tab}`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error('Failed to load leaderboard')
                const { leaderboard, levelNumber: lvl } = await res.json()
                setData(leaderboard)
                if (lvl) setLevelNumber(lvl)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [tab])

    const tabLabel = tab === 'alltime' ? 'ALL TIME' : `LEVEL ${levelNumber ?? '...'}`

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

            {/* Topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
                <button
                    onClick={onBack}
                    style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                    ← Back
                </button>
                <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          LEADERBOARD
        </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: '#00ff88', fontFamily: 'monospace' }}>
          TOP 10 AGENTS
        </span>
            </div>

            <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 6 }}>
                        GLOBAL RANKINGS
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace', marginBottom: 6 }}>
                        Agent Leaderboard
                    </h1>
                    <p style={{ fontSize: 13, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.6 }}>
                        Top agents ranked by XP earned. Tie-broken by earliest completion date.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
                    {['alltime', 'level'].map(t => {
                        const label  = t === 'alltime' ? 'All Time' : `Level ${levelNumber ?? '...'}`
                        const active = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    fontFamily: 'monospace', fontSize: 12,
                                    letterSpacing: '0.08em',
                                    padding: '8px 20px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    border: `1px solid ${active ? '#00ff88' : '#1a2a45'}`,
                                    background: active ? '#003322' : 'transparent',
                                    color: active ? '#00ff88' : '#4a6fa5',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {active ? '◈ ' : ''}{label}
                            </button>
                        )
                    })}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#4a6fa5', fontFamily: 'monospace' }}>
                        <div style={{ color: '#00ff88', marginBottom: 8 }}>◈ FETCHING INTEL...</div>
                        <div style={{ fontSize: 11, color: '#2a3a55' }}>Querying the database</div>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#e24b4a', fontFamily: 'monospace' }}>
                        ✘ {error}
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && data.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#2a3a55', fontFamily: 'monospace' }}>
                        <div style={{ fontSize: 28, marginBottom: 12 }}>⬡</div>
                        No agents ranked yet. Complete missions to appear here.
                    </div>
                )}

                {/* Leaderboard rows */}
                {!loading && !error && data.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                        {/* Column headers */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', marginBottom: 4 }}>
                            <span style={{ width: 40, fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>RANK</span>
                            <span style={{ flex: 1, fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>AGENT</span>
                            <span style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', letterSpacing: '0.1em' }}>XP</span>
                        </div>

                        {data.map((entry, idx) => {
                            const rank        = idx + 1
                            const isCurrentAgent = String(entry.agentId) === String(agent?._id ?? agent?.id ?? '')
                            const rankColor   = RANK_COLORS[rank] || '#4a6fa5'
                            const rankIcon    = RANK_ICONS[rank]

                            return (
                                <div
                                    key={String(entry.agentId)}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        padding: '14px 16px',
                                        borderRadius: 10,
                                        background: isCurrentAgent
                                            ? '#0d2a1a'
                                            : rank <= 3 ? '#080c17' : '#080c17',
                                        border: isCurrentAgent
                                            ? '1px solid #00ff8866'
                                            : rank === 1 ? `1px solid ${rankColor}44`
                                                : '1px solid #1a2a45',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Glow accent for top 3 */}
                                    {rank <= 3 && (
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0, bottom: 0,
                                            width: 3, background: rankColor,
                                            boxShadow: `0 0 8px ${rankColor}`,
                                        }} />
                                    )}

                                    {/* Rank */}
                                    <div style={{ width: 40, paddingLeft: rank <= 3 ? 8 : 0 }}>
                                        {rankIcon
                                            ? <span style={{ fontSize: 18 }}>{rankIcon}</span>
                                            : <span style={{ fontSize: 13, color: rankColor, fontFamily: 'monospace', fontWeight: 'bold' }}>#{rank}</span>
                                        }
                                    </div>

                                    {/* Codename */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                          fontSize: 14, fontWeight: 500,
                          color: isCurrentAgent ? '#00ff88' : '#c8daf0',
                          fontFamily: 'monospace',
                      }}>
                        {entry.codename}
                      </span>
                                            {isCurrentAgent && (
                                                <span style={{
                                                    fontSize: 9, color: '#00ff88',
                                                    border: '1px solid #00ff8844',
                                                    borderRadius: 4, padding: '2px 6px',
                                                    fontFamily: 'monospace', letterSpacing: '0.1em',
                                                }}>
                          YOU
                        </span>
                                            )}
                                        </div>
                                        {entry.lastCompleted && (
                                            <div style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace', marginTop: 2 }}>
                                                Last active {new Date(entry.lastCompleted).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* XP */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: 16, fontWeight: 'bold',
                                            color: rank <= 3 ? rankColor : '#c8daf0',
                                            fontFamily: 'monospace',
                                        }}>
                                            {entry.totalXP.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: 10, color: '#2a3a55', fontFamily: 'monospace' }}>XP</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div style={{ height: '3rem' }} />
            </div>
        </div>
    )
}