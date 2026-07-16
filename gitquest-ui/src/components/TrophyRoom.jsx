import { ACHIEVEMENTS } from '../game/achievements'
import { useProgress } from '../context/useProgress'
import {
  completedCount, totalLevels, missionsCompleted,
  perfectScores, averageScore, earnedCoins,
} from '../game/stats'
import { MISSION_ORDER } from '../missions/Missions'

const RARITY = {
  common: { label: 'COMMON', color: '#4a6fa5', border: '#1a2a45', bg: '#0a1220' },
  uncommon: { label: 'UNCOMMON', color: '#00cc66', border: '#00ff8833', bg: '#0d1f15' },
  rare: { label: 'RARE', color: '#9a6fcf', border: '#4a2a8a44', bg: '#110d1f' },
  legendary: { label: 'LEGENDARY', color: '#e4a020', border: '#a0600033', bg: '#1a1005' },
}

function TrophyCard({ trophy, earnedDate }) {
  const r = RARITY[trophy.rarity]
  const earned = Boolean(earnedDate)
  return (
    <div style={{
      background: earned ? r.bg : '#0a0e1a',
      border: `1px solid ${earned ? r.border : '#1a2a45'}`,
      borderRadius: 10, padding: '1.1rem',
      opacity: earned ? 1 : 0.55,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 24, filter: earned ? 'none' : 'grayscale(1)' }}>{trophy.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: earned ? '#c8daf0' : '#4a6fa5', fontFamily: 'monospace' }}>{trophy.name}</span>
          <span style={{ fontSize: 9, letterSpacing: '0.1em', color: r.color, border: `1px solid ${r.border}`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace' }}>{r.label}</span>
        </div>
        <div style={{ fontSize: 12, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.6 }}>{trophy.desc}</div>
        <div style={{ fontSize: 10, color: earned ? '#00cc66' : '#2a3a55', fontFamily: 'monospace', marginTop: 6 }}>
          {earned ? `EARNED ${earnedDate}` : 'LOCKED'}
        </div>
      </div>
    </div>
  )
}

export default function TrophyRoom({ onBack }) {
  const { progress } = useProgress()

  const earnedMap = progress.achievements ?? {}
  const earned = ACHIEVEMENTS.filter(t => earnedMap[t.id])
  const locked = ACHIEVEMENTS.filter(t => !earnedMap[t.id])

  const avg = averageScore(progress)
  // Every stat below is derived from real progress state — nothing hard-coded.
  const stats = [
    { label: 'Missions complete', value: `${missionsCompleted(progress)} / ${MISSION_ORDER.length}` },
    { label: 'Battles won', value: `${completedCount(progress)} / ${totalLevels()}` },
    { label: 'Perfect scores', value: `${perfectScores(progress)}` },
    { label: 'Average score', value: avg === null ? '—' : `${avg} / 100` },
    { label: 'Coins earned', value: `${earnedCoins(progress)}` },
    { label: 'Hints used', value: `${progress.hintsUsed ?? 0}` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
          ← back
        </button>
        <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>TROPHY ROOM</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#00ff88', fontFamily: 'monospace' }}>{earned.length} / {ACHIEVEMENTS.length} UNLOCKED</span>
      </div>

      <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Field record — derived stats */}
        <div style={{ fontSize: 11, color: '#00ff8888', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>FIELD RECORD</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: '2.5rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 16, color: '#c8daf0', fontFamily: 'monospace', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Earned */}
        <div style={{ fontSize: 11, color: '#00ff8888', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
          EARNED ({earned.length})
        </div>
        {earned.length === 0 ? (
          <div style={{ color: '#2a3a55', fontFamily: 'monospace', fontSize: 12, marginBottom: '2rem' }}>
            No trophies yet — complete your first battle to earn First Blood.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2.5rem' }}>
            {earned.map(t => <TrophyCard key={t.id} trophy={t} earnedDate={earnedMap[t.id]} />)}
          </div>
        )}

        {/* Locked */}
        <div style={{ fontSize: 11, color: '#4a6fa5', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
          LOCKED ({locked.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {locked.map(t => <TrophyCard key={t.id} trophy={t} earnedDate={null} />)}
        </div>

        <div style={{ height: '3rem' }} />
      </div>
    </div>
  )
}
