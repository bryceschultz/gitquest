import { useRef, useState } from 'react'
import { MISSIONS, MISSION_ORDER } from '../missions/Missions'
import { useProgress } from '../context/useProgress'
import { isMissionUnlocked, isLevelUnlocked, nextPlayableLevel } from '../game/unlocks'
import { overallPct, coinBalance, missionsCompleted, missionProgress } from '../game/stats'

const DIFF_STARS = { easy: 1, med: 2, hard: 3 }

function StarRating({ diff }) {
  const count = DIFF_STARS[diff] || 1
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={i <= count ? '#00ff88' : '#1a2a45'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: 10, marginLeft: 4, fontFamily: 'monospace', color: '#4a6fa5' }}>{diff}</span>
    </span>
  )
}

function LevelRow({ level, questId, isLevelComplete, progress, onStartLevel, fieldAssignment = false }) {
  const levelIsDone = isLevelComplete(level.id)
  const unlocked = isLevelUnlocked(level.id, progress)
  const clickable = unlocked || levelIsDone
  const accent = fieldAssignment ? '#e4a020' : '#00ff88'

  return (
    <button
      onClick={() => clickable && onStartLevel(level.id, questId)}
      disabled={!clickable}
      title={clickable ? (levelIsDone ? 'Replay this lesson' : 'Open this lesson') : 'Locked — complete the previous lessons first'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: levelIsDone ? '#0d1f15' : fieldAssignment ? '#141005' : '#080c17',
        border: `1px solid ${levelIsDone ? '#00ff8833' : fieldAssignment ? '#a0600055' : '#1a2a45'}`,
        borderRadius: 8, padding: '10px 14px', width: '100%',
        cursor: clickable ? 'pointer' : 'not-allowed',
        opacity: clickable ? 1 : 0.45, textAlign: 'left',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: levelIsDone ? '#00ff88' : '#2a3a55', fontFamily: 'monospace', minWidth: 16 }}>
          {levelIsDone ? '✓' : unlocked ? (fieldAssignment ? '⚔' : '○') : '🔒'}
        </span>
        <span style={{ fontSize: 13, color: levelIsDone ? '#00cc66' : unlocked ? (fieldAssignment ? accent : '#c8daf0') : '#4a6fa5', fontFamily: 'monospace' }}>
          {level.id} — {level.cmd}
        </span>
        {levelIsDone && (
          <span style={{ fontSize: 10, color: '#4a6fa5', fontFamily: 'monospace', border: '1px solid #1a2a45', borderRadius: 4, padding: '1px 6px' }}>↺ replay</span>
        )}
      </div>
      <StarRating diff={level.diff} />
    </button>
  )
}

function MissionPanel({ quest, onClose, onStartLevel }) {
  const { isLevelComplete, progress } = useProgress()
  const { completed, total } = missionProgress(quest.id, progress)
  const startLevelId = nextPlayableLevel(quest.id, progress)
  const missionDone = total > 0 && completed === total

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(8,12,23,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        background: '#0d1526', border: '1px solid #1a2a45',
        borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 480,
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#00ff88', fontSize: 18 }}>◎</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace' }}>{quest.title}</div>
              <div style={{ fontSize: 11, color: '#4a6fa5', marginTop: 3, fontFamily: 'monospace' }}>
                LEVELS {completed}/{total}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a6fa5', fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#1a2a45', borderRadius: 99, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ height: '100%', width: total > 0 ? `${(completed / total) * 100}%` : '0%', background: '#00ff88', borderRadius: 99, transition: 'width 0.4s' }} />
        </div>

        {/* Levels grouped by assignment; the Field Assignment renders as the
            mission finale. Falls back to a flat list if a mission has no
            assignment metadata. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
          {(quest.assignments ?? [{ id: `${quest.id}-all`, title: null, lessons: Object.keys(quest.levels).filter(id => id !== quest.fieldAssignment) }]).map(assignment => (
            <div key={assignment.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {assignment.title && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#00ff8899', fontFamily: 'monospace' }}>{assignment.title.toUpperCase()}</div>
                  {assignment.desc && <div style={{ fontSize: 10, color: '#4a6fa5', fontFamily: 'monospace', marginTop: 2 }}>{assignment.desc}</div>}
                </div>
              )}
              {assignment.lessons.map(levelId => {
                const level = quest.levels[levelId]
                if (!level) return null
                return (
                  <LevelRow key={level.id} level={level} questId={quest.id}
                    isLevelComplete={isLevelComplete} progress={progress} onStartLevel={onStartLevel} />
                )
              })}
            </div>
          ))}
          {quest.fieldAssignment && quest.levels[quest.fieldAssignment] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ marginTop: 4, fontSize: 10, letterSpacing: '0.1em', color: '#e4a020', fontFamily: 'monospace' }}>
                ⚔ FIELD ASSIGNMENT — all commands, in sequence
              </div>
              <LevelRow level={quest.levels[quest.fieldAssignment]} questId={quest.id}
                isLevelComplete={isLevelComplete} progress={progress} onStartLevel={onStartLevel} fieldAssignment />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: startLevelId ? '#003322' : '#0d1526',
            border: `1px solid ${startLevelId ? '#00ff88' : '#1a2a45'}`,
            color: startLevelId ? '#00ff88' : '#2a3a55',
            borderRadius: 8, padding: '10px 20px', cursor: startLevelId ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace', fontSize: 13, fontWeight: 500,
          }}
            onClick={() => startLevelId && onStartLevel(startLevelId, quest.id)}
            disabled={!startLevelId}
          >
            ▶ {missionDone ? 'Replay' : 'Start'}
          </button>
          {missionDone && (
            <span style={{ fontSize: 11, color: '#00cc66', fontFamily: 'monospace' }}>✓ mission complete — all lessons replayable</span>
          )}
        </div>
      </div>
    </div >
  )
}

export default function MissionMap({ onBack, onStartLevel, onOpenArsenal, onOpenTrophy }) {
  const { progress, exportProgress, importProgress, resetProgress } = useProgress()
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [importError, setImportError] = useState(null)
  const fileInputRef = useRef(null)

  const pct = overallPct(progress)
  const coins = coinBalance(progress)
  const missionsDone = missionsCompleted(progress)
  const isRecruit = progress.mode !== 'vet'
  const recommended = progress.placement?.recommendedMission

  const handleQuestClick = (quest, locked) => {
    if (!locked) setSelectedQuest(quest)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await importProgress(file)
      setImportError(null)
    } catch {
      setImportError('Import failed: not a valid GitQuest progress file.')
    }
  }

  // Path segments between consecutive mission node centers, derived from data.
  const centers = MISSION_ORDER.map(id => ({ id, x: MISSIONS[id].x + 20, y: MISSIONS[id].y + 20 }))
  const lines = centers.slice(0, -1).map((c, i) => [c.x, c.y, centers[i + 1].x, centers[i + 1].y])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Topbar — every value here is derived from progress state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17' }}>
        <span style={{ fontSize: 11, color: '#00ff88', border: '1px solid #00ff8833', borderRadius: 4, padding: '3px 10px', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          {isRecruit ? 'NEW RECRUIT' : 'FIELD AGENT'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#4a6fa5', marginBottom: 4, letterSpacing: '0.08em', fontFamily: 'monospace' }}>OVERALL PROGRESS — {pct}%</div>
          <div style={{ height: 5, background: '#1a2a45', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#00ff88', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
        </div>
        <span title="Missions completed" style={{ fontSize: 12, color: '#c8daf0', fontFamily: 'monospace' }}>🎖 {missionsDone}/{MISSION_ORDER.length}</span>
        <span title="Coin balance" style={{ fontSize: 12, color: '#c8daf0', fontFamily: 'monospace' }}>💰 {coins}</span>
      </div>

      {/* Map area */}
      <div style={{ flex: 1, padding: '1.5rem', position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.12em', marginBottom: '1rem', fontFamily: 'monospace' }}>MISSION MAP — OPERATION SHADOW BREACH</div>

        {!isRecruit && recommended && (
          <div style={{ display: 'inline-block', fontSize: 11, color: '#00cc66', fontFamily: 'monospace', border: '1px solid #00ff8833', background: '#0d1f15', borderRadius: 6, padding: '6px 12px', marginBottom: '1rem' }}>
            📋 placement result: {progress.placement.pct}% — recommended start: {recommended} — {MISSIONS[recommended]?.title.split('— ')[1]}
          </div>
        )}

        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {[{ label: 'Trophy room', icon: '🏆', action: onOpenTrophy }, { label: 'Arsenal', icon: '🔧', action: onOpenArsenal }].map(({ label, icon, action }) => (
            <button
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#c8daf0', background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 99, padding: '7px 16px', cursor: 'pointer', fontFamily: 'monospace' }}
              onClick={action}
            >
              {icon} {label}
            </button>
          ))}
          <button onClick={onBack} style={{ fontSize: 11, color: '#2a3a55', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace', marginTop: 4 }}>
            ← switch route
          </button>
          {/* Local save data controls */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={exportProgress} title="Download progress as JSON" style={{ fontSize: 10, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>⇩ export</button>
            <button onClick={() => fileInputRef.current?.click()} title="Load progress from JSON" style={{ fontSize: 10, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>⇧ import</button>
            <button
              onClick={() => { if (window.confirm('Reset ALL GitQuest progress? This cannot be undone.')) resetProgress() }}
              title="Erase all saved progress"
              style={{ fontSize: 10, color: '#e24b4a88', background: 'none', border: '1px solid #e24b4a33', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace' }}>
              ✕ reset
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImport} style={{ display: 'none' }} data-testid="import-input" />
          </div>
          {importError && <div style={{ fontSize: 10, color: '#e24b4a', fontFamily: 'monospace' }}>{importError}</div>}
        </div>

        <svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 480 }}>
          {lines.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#1a2a45" strokeWidth="1.5" strokeDasharray="5,4" />
          ))}
          {MISSION_ORDER.map(id => {
            const q = MISSIONS[id]
            const { completed, total } = missionProgress(q.id, progress)
            const missionDone = total > 0 && completed === total
            const locked = !isMissionUnlocked(q.id, progress)
            const missionActive = !locked && !missionDone

            return (
              <g key={q.id} onClick={() => handleQuestClick(q, locked)}
                style={{ cursor: locked ? 'not-allowed' : 'pointer' }}>
                <rect x={q.x} y={q.y} width="40" height="40" rx="6"
                  fill={missionActive ? '#003322' : missionDone ? '#0d1f15' : '#0d1526'}
                  stroke={missionActive ? '#00ff88' : missionDone ? '#00ff8844' : '#1a2a45'}
                  strokeWidth={missionActive ? 1.5 : 1}
                />
                <text x={q.x + 20} y={q.y + 25} textAnchor="middle" fontSize="13"
                  fill={missionActive ? '#00ff88' : missionDone ? '#00ff88' : '#1a2a45'}
                  fontFamily="monospace">
                  {missionDone ? '✓' : locked ? '⬡' : '◎'}
                </text>
                <text x={q.x + 20} y={q.y + 54} textAnchor="middle" fontSize="10"
                  fill={missionActive ? '#00cc66' : missionDone ? '#00ff8877' : '#2a3a55'}
                  fontFamily="monospace">
                  {q.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Mission detail overlay */}
        {selectedQuest && (
          <MissionPanel
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onStartLevel={onStartLevel}
          />
        )}
      </div>
    </div>
  )
}
