import {useEffect, useState} from 'react'
import {useProgress} from '../context/ProgressContext'

const BASE_URL = import.meta.env.VITE_API_URL // const BASE_URL = 'http://localhost:5001/api'
const LEVEL_COLORS = {1: '#00ff88', 2: '#ffb700', 3: '#ff4444'}

const NODE_SIZE = 80
const SVG_W = 480
const SVG_H = 180

// Centered: total width of 3 nodes + 2 gaps of 60px = 3*80 + 2*60 = 360, offset = (480-360)/2 = 60
const nodePositions = [
    {x: 60, y: 50},
    {x: 200, y: 50},
    {x: 340, y: 50},
]

/**
 *
 * @param param0
 * @param param0.xpReward
 * @returns {JSX.Element}
 * @constructor
 */
function StarRating({xpReward}) {
    const stars = xpReward <= 10 ? 1 : xpReward <= 20 ? 2 : 3
    const label = xpReward <= 10 ? 'easy' : xpReward <= 20 ? 'med' : 'hard'

    return (
        <span style={{display: 'flex', alignItems: 'center', gap: 2}}>
            {[1, 2, 3].map(i => (
                <svg
                    key={i}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={i <= stars ? '#00ff88' : '#1a2a45'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    />
                </svg>
            ))}

            <span
                style={{
                    fontSize: 10,
                    marginLeft: 4,
                    fontFamily: 'monospace',
                    color: '#4a6fa5'
                }}
            >
                {label}
            </span>
        </span>
    )
}

/**
 *
 * @param param0
 * @param param0.type
 * @param param0.label
 * @param param0.assignment
 * @param param0.description
 * @returns {JSX.Element}
 */
function AssignmentHeader({ type, label, assignment, description }) {
    return (
        <div
            style={{
                marginTop: 12,
                marginBottom: 8,
                padding: '10px 12px',
                background: '#07120f',
                borderRadius: '6px',
                border: '1px solid #00ff8833',
                boxShadow: '0 0 8px rgba(0,255,136,0.08)',
            }}
        >
      <span
          style={{
              display: 'block',
              fontSize: 10,
              color: '#00ff88',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              marginBottom: 5,
          }}
      >
        {type} {label} {assignment ? `- ${assignment}` : ''}
      </span>
            <div
                style={{
                    fontSize: 10,
                    color: '#4a6fa5',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                }}
            >
                {description}
            </div>
        </div>
    )
}

/**
 *
 * @param param0
 * @param param0.type
 * @param param0.label
 * @param param0.assignment
 * @param param0.description
 * @returns {JSX.Element}
 * @constructor
 */
function FieldAssignmentHeader({ type, label, assignment, description }) {
    return (
        <div
            style={{
                marginTop: 12,
                marginBottom: 8,
                padding: '10px 12px',
                background: '#120a00',
                borderRadius: '6px',
                border: '1px solid #ff5f1f66',
                boxShadow: '0 0 8px rgba(255,95,31,0.15)',
            }}
        >
      <span
          style={{
              display: 'block',
              fontSize: 10,
              color: '#ff5f1f',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              marginBottom: 5,
          }}
      >
        {type} {label} {assignment ? `- ${assignment}` : ''}
      </span>
            <div
                style={{
                    fontSize: 10,
                    color: '#4a6fa5',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                }}
            >
                {description}
            </div>
        </div>
    )
}

/**
 *
 * @param param0
 * @param param0.mission
 * @param param0.level
 * @returns {JSX.Element|null}
 * @constructor
 */
function MissionAssignmentHeader({ mission, level }) {
    const lvl = level.levelNumber

    switch (mission.missionNumber) {
        case 1:
            return (
                <AssignmentHeader
                    type="ASSIGNMENT"
                    label={`${lvl}.1`}
                    description="Learn the core Git workflow and establish your local copy of the operation."
                />
            )
        case 5:
            return (
                <FieldAssignmentHeader
                    type="FIELD ASSIGNMENT"
                    label="1"
                    description="Complete your first field operation by applying the Git skills learned in the previous assignments."
                />
            )
        case 6:
            return (
                <AssignmentHeader
                    type="ASSIGNMENT"
                    label={`${lvl}.2`}
                    description="Advance your Git skills by working with branches, changes, and collaboration workflows."
                />
            )
        case 10:
            return (
                <FieldAssignmentHeader
                    type="FIELD ASSIGNMENT"
                    label="2"
                    description="Complete your second field operation by applying the skills learned throughout the assignments."
                />
            )
        default:
            return null
    }
}

/**
 *
 * @param param0
 * @param param0.level
 * @param param0.missions
 * @param param0.agent
 * @param param0.onClose
 * @param param0.onStartLevel
 * @returns {JSX.Element}
 * @constructor
 */
function MissionPanel({level, missions, onClose, onStartLevel}) {
    const {isLevelComplete} = useProgress()
    const color = LEVEL_COLORS[level.levelNumber] || '#00ff88'
    const completed = missions.filter(m => isLevelComplete(m._id)).length
    const total = missions.length
    const nextMission = missions.find(m => !isLevelComplete(m._id))

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                background: 'rgba(8,12,23,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
            }}
        >
            <div
                style={{
                    background: '#0d1526',
                    border: `1px solid ${color}44`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: 12,
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: 480,
                    position: 'relative',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '1.25rem'
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <span style={{color, fontSize: 20}}>◎</span>

                        <div>
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 500,
                                    color: '#c8daf0',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {level.title}
                            </div>

                            <div
                                style={{
                                    fontSize: 11,
                                    color: '#4a6fa5',
                                    marginTop: 3,
                                    fontFamily: 'monospace'
                                }}
                            >
                                {completed}/{total} MISSIONS COMPLETE
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#4a6fa5',
                            fontSize: 18,
                            lineHeight: 1,
                            padding: 0
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Progress bar */}
                <div
                    style={{
                        height: 4,
                        background: '#1a2a45',
                        borderRadius: 99,
                        overflow: 'hidden',
                        marginBottom: '1.25rem'
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                            background: color,
                            borderRadius: 99,
                            transition: 'width 0.4s'
                        }}
                    />
                </div>

                {/* Mission list */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        marginBottom: '1.5rem'
                    }}
                >
                    {missions.map((mission, idx) => {
                        const done      = isLevelComplete(mission._id)
                        const isNext    = nextMission?._id === mission._id
                        const locked    = idx > 0 && !isLevelComplete(missions[idx - 1]._id) && !done
                        const isField   = mission.missionNumber === 5 || mission.missionNumber === 10
                        const rowColor  = isField ? '#ff5f1f' : color

                        return (
                            <div key={mission._id}>
                                <MissionAssignmentHeader mission={mission} level={level} />

                                <div
                                    onClick={() => { if (!locked) onStartLevel(mission._id, level._id, missions) }}
                                    style={{
                                        display:        'flex',
                                        alignItems:     'center',
                                        justifyContent: 'space-between',
                                        background: done
                                            ? (isField ? '#130800' : '#0d1f15')
                                            : isNext
                                                ? (isField ? '#0f0500' : '#03150d')
                                                : (isField ? '#0a0400' : '#080c17'),
                                        border: `1px solid ${
                                            done   ? rowColor + '55' :
                                                isNext ? rowColor + '88' :
                                                    isField ? '#ff5f1f33' : '#1a2a45'
                                        }`,
                                        boxShadow: isField ? `0 0 8px rgba(255,95,31,0.1)` : 'none',
                                        borderRadius:   8,
                                        padding:        '10px 14px',
                                        cursor:         locked ? 'not-allowed' : 'pointer',
                                        opacity:        locked ? 0.4 : 1,
                                        transition:     'opacity 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
              fontSize:   12,
              fontFamily: 'monospace',
              minWidth:   16,
              color: done   ? rowColor :
                  isNext ? rowColor + '99' : '#2a3a55',
          }}>
            {done ? '✓' : locked ? '🔒' : isNext ? '▶' : '○'}
          </span>

                                        <span style={{
                                            fontSize:   12,
                                            color: done   ? (isField ? '#ff8c55' : '#00cc66') :
                                                locked ? '#2a3a55' :
                                                    isField ? '#ffb07a' : '#c8daf0',
                                            fontFamily: 'monospace',
                                        }}>
            {`M${mission.missionNumber} · ${mission.title.replace(/^Mission \d+ · /, '')}`}
          </span>
                                    </div>

                                    <StarRating xpReward={mission.xpReward} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Start button */}
                <button
                    disabled={!nextMission}
                    onClick={() =>
                        nextMission &&
                        onStartLevel(
                            nextMission._id,
                            level._id,
                            missions
                        )
                    }
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: nextMission ? '#003322' : '#0d1526',
                        border: `1px solid ${
                            nextMission ? color : '#1a2a45'
                        }`,
                        color: nextMission ? color : '#2a3a55',
                        borderRadius: 8,
                        padding: '10px 20px',
                        cursor: nextMission ? 'pointer' : 'not-allowed',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    ▶{' '}
                    {nextMission
                        ? `Start Mission ${nextMission.missionNumber}`
                        : '✓ Level Complete'}
                </button>
            </div>
        </div>
    )
}

/**
 *
 * @param param0
 * @param param0.agent
 * @param param0.onBack
 * @param param0.onStartLevel
 * @param param0.onOpenArsenal
 * @param param0.onOpenTrophy
 * @returns {JSX.Element}
 * @constructor
 */
export default function MissionMap({
                                       agent,
                                       onBack,
                                       onStartLevel,
                                       onOpenArsenal,
                                       onOpenTrophy,
                                       onOpenLeaderboard
                                   }) {
    const {isLevelComplete, progress} = useProgress()
    const [levels, setLevels] = useState([])
    const [missions, setMissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLevel, setSelectedLevel] = useState(null)
    const [showCredits, setShowCredits] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [lvlRes, msnRes] = await Promise.all([
                    fetch(`${BASE_URL}/levels`, {
                        credentials: 'include'
                    }),
                    fetch(`${BASE_URL}/missions`, {
                        credentials: 'include'
                    }),
                ])

                const {levels: lvls} = await lvlRes.json()
                const {missions: msns} = await msnRes.json()

                setLevels(
                    lvls.sort(
                        (a, b) => a.levelNumber - b.levelNumber
                    )
                )

                setMissions(msns)
            } catch (err) {
                console.error('Failed to load map data:', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00ff88',
                    fontFamily: 'monospace'
                }}
            >
                ◈ LOADING MISSION MAP...
            </div>
        )
    }

    const totalCompleted = missions.filter(
        m => isLevelComplete(m._id)
    ).length

    const totalMissions = missions.length

    const selectedMissions = selectedLevel
        ? missions
            .filter(m => m.levelId === selectedLevel._id)
            .sort(
                (a, b) =>
                    a.missionNumber - b.missionNumber
            )
        : []

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative',
                zIndex: 1
            }}
        >
            {/* Topbar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: '1px solid #1a2a45',
                    background: '#080c17',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        color: '#00ff88',
                        border: '1px solid #00ff8833',
                        borderRadius: 4,
                        padding: '3px 10px',
                        letterSpacing: '0.08em',
                        fontFamily: 'monospace'
                    }}
                >
                    AGENT
                </span>

                <div style={{flex: 1}}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 4
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10,
                                color: '#4a6fa5',
                                letterSpacing: '0.08em',
                                fontFamily: 'monospace'
                            }}
                        >
                            MISSION PROGRESS
                        </span>

                        <span
                            style={{
                                fontSize: 10,
                                color: '#00ff88',
                                fontFamily: 'monospace'
                            }}
                        >
                            {totalCompleted}/{totalMissions}
                        </span>
                    </div>

                    <div
                        style={{
                            height: 5,
                            background: '#1a2a45',
                            borderRadius: 99,
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${
                                    totalMissions > 0
                                        ? (totalCompleted / totalMissions) * 100
                                        : 0
                                }%`,
                                background: '#00ff88',
                                borderRadius: 99,
                                transition: 'width 0.5s'
                            }}
                        />
                    </div>
                </div>

                <span
                    style={{
                        fontSize: 12,
                        color:
                            agent?.streak > 0
                                ? '#ff6b35'
                                : '#2a3a55',
                        fontFamily: 'monospace'
                    }}
                >
                    🔥 {agent?.streak ?? 0}
                </span>

                <span
                    style={{
                        fontSize: 12,
                        color: '#c8daf0'
                    }}
                >
                    💰 {progress.coins ?? 0}
                </span>
            </div>

            {/* Map area */}
            <div
                style={{
                    flex: 1,
                    padding: '1.5rem',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        color: '#4a6fa5',
                        letterSpacing: '0.12em',
                        marginBottom: '1.5rem',
                        fontFamily: 'monospace'
                    }}
                >
                    MISSION MAP — OPERATION SHADOW BREACH
                </div>

                {/* Side buttons */}
                <div
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    }}
                >
                    {['Trophy Room', 'Arsenal'].map(label => (
                        <button
                            key={label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 12,
                                color: '#c8daf0',
                                background: '#0d1526',
                                border: '1px solid #1a2a45',
                                borderRadius: 99,
                                padding: '7px 16px',
                                cursor: 'pointer',
                                fontFamily: 'monospace'
                            }}
                            onClick={() =>
                                label === 'Arsenal'
                                    ? onOpenArsenal()
                                    : onOpenTrophy()
                            }
                        >
                            {label === 'Trophy Room'
                                ? '🏆'
                                : '🔧'}{' '}
                            {label}
                        </button>
                    ))}

                    <button
                        onClick={onOpenLeaderboard}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#c8daf0',
                            background: '#0d1526',
                            border: '1px solid #1a2a45',
                            borderRadius: 99,
                            padding: '7px 16px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        🏆 Leaderboard
                    </button>

                    <button
                        onClick={onBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#e24b4a',
                            background: '#0d1526',
                            border: '1px solid #e24b4a44',
                            borderRadius: 99,
                            padding: '7px 16px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        ✕ Abort
                    </button>

                    <button
                        onClick={() => setShowCredits(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: '#00ff88',
                            background: '#0d1526',
                            border: '1px solid #1a2a45',
                            borderRadius: 99,
                            padding: '7px 16px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        ℹ Credits
                    </button>

                    {showCredits && (
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 100,
                                background: 'rgba(4,8,16,0.92)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1.5rem',
                            }}
                        >
                            <div
                                style={{
                                    background: '#0d1526',
                                    border: '1px solid #00ff8844',
                                    borderTop: '3px solid #00ff88',
                                    borderRadius: 12,
                                    padding: '2rem',
                                    width: '100%',
                                    maxWidth: 460,
                                    fontFamily: 'monospace',
                                    position: 'relative',
                                }}
                            >
                                {/* Close */}
                                <button
                                    onClick={() =>
                                        setShowCredits(false)
                                    }
                                    style={{
                                        position: 'absolute',
                                        top: 14,
                                        right: 16,
                                        background: 'none',
                                        border: 'none',
                                        color: '#4a6fa5',
                                        fontSize: 18,
                                        cursor: 'pointer',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>

                                {/* Title */}
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: '#4a6fa5',
                                        letterSpacing: '0.14em',
                                        marginBottom: 6
                                    }}
                                >
                                    ABOUT
                                </div>

                                <div
                                    style={{
                                        fontSize: 18,
                                        color: '#00ff88',
                                        fontWeight: 'bold',
                                        marginBottom: 4
                                    }}
                                >
                                    Git
                                    <span style={{color: '#c8daf0'}}>
                                        Quest
                                    </span>
                                </div>

                                <div
                                    style={{
                                        fontSize: 12,
                                        color: '#4a6fa5',
                                        marginBottom: '1.5rem',
                                        lineHeight: 1.7
                                    }}
                                >
                                    An interactive web app designed to teach
                                    Git through immersive, story-driven
                                    missions. Players take on the role of a
                                    cyber agent battling Shadow Breach —
                                    learning real Git commands through
                                    hands-on field scenarios, progressive
                                    levels, and a live leaderboard.
                                </div>

                                {/* Divider */}
                                <div
                                    style={{
                                        height: 1,
                                        background: '#1a2a45',
                                        marginBottom: '1.25rem'
                                    }}
                                />

                                {/* Tech stack */}
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: '#4a6fa5',
                                        letterSpacing: '0.14em',
                                        marginBottom: 10
                                    }}
                                >
                                    BUILT WITH
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    {[
                                        'React',
                                        'JavaScript',
                                        'Node.js',
                                        'Express',
                                        'MongoDB',
                                        'Mongoose',
                                        'Vite',
                                        'REST API',
                                        'JWT'
                                    ].map(tech => (
                                        <span
                                            key={tech}
                                            style={{
                                                fontSize: 11,
                                                color: '#00ff88',
                                                background: '#00ff8811',
                                                border:
                                                    '1px solid #00ff8833',
                                                borderRadius: 4,
                                                padding: '3px 10px',
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div
                                    style={{
                                        height: 1,
                                        background: '#1a2a45',
                                        marginBottom: '1.25rem'
                                    }}
                                />

                                {/* Team */}
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: '#4a6fa5',
                                        letterSpacing: '0.14em',
                                        marginBottom: 10
                                    }}
                                >
                                    AGENTS
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    {[
                                        'Maria Sicilia',
                                        'Bryce Schultz',
                                        'Kevin Warner',
                                        'Preeti Sagar',
                                        'Anas Sallam',
                                    ].map((name, i) => (
                                        <div
                                            key={name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    color: '#2a3a55',
                                                    minWidth: 20,
                                                    fontFamily: 'monospace'
                                                }}
                                            >
                                                0{i + 1}
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: '#c8daf0'
                                                }}
                                            >
                                                {name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div
                                    style={{
                                        height: 1,
                                        background: '#1a2a45',
                                        marginBottom: '1.25rem'
                                    }}
                                />

                                {/* Copyright */}
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: '#2a3a55',
                                        textAlign: 'center',
                                        letterSpacing: '0.06em'
                                    }}
                                >
                                    © 2026 GitQuest · v1.05 · All rights
                                    reserved
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SVG map — centered nodes */}
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '100%',
                        maxWidth: SVG_W,
                        display: 'block',
                        margin: '0 auto'
                    }}
                >
                    {/* Connector lines — LVL1→LVL2 and LVL2→LVL3 only */}
                    {nodePositions.slice(0, 2).map((pos, i) => {
                        const next = nodePositions[i + 1]
                        const lvl = levels[i]
                        const lvlMsn = missions.filter(
                            m => m.levelId === lvl?._id
                        )
                        const done =
                            lvlMsn.length > 0 &&
                            lvlMsn.every(m =>
                                isLevelComplete(m._id)
                            )

                        return (
                            <line
                                key={i}
                                x1={
                                    pos.x +
                                    NODE_SIZE
                                }
                                y1={
                                    pos.y +
                                    NODE_SIZE / 2
                                }
                                x2={next.x}
                                y2={
                                    next.y +
                                    NODE_SIZE / 2
                                }
                                stroke={
                                    done
                                        ? '#00ff8844'
                                        : '#1a2a45'
                                }
                                strokeWidth="1.5"
                                strokeDasharray="5,4"
                            />
                        )
                    })}

                    {/* Level nodes */}
                    {levels.map((level, idx) => {
                        const pos = nodePositions[idx]
                        if (!pos) return null

                        const color =
                            LEVEL_COLORS[level.levelNumber] ||
                            '#00ff88'

                        const lvlMsns = missions.filter(
                            m => m.levelId === level._id
                        )

                        const doneCount = lvlMsns.filter(
                            m => isLevelComplete(m._id)
                        ).length

                        const total = lvlMsns.length

                        const isComplete =
                            doneCount === total &&
                            total > 0

                        const isActive =
                            doneCount > 0 &&
                            !isComplete

                        const isFirst = idx === 0

                        const accessible =
                            idx === 0 ||
                            levels
                                .slice(0, idx)
                                .every(l => {
                                    const lm = missions.filter(
                                        m =>
                                            m.levelId ===
                                            l._id
                                    )

                                    return (
                                        lm.length > 0 &&
                                        lm.every(m =>
                                            isLevelComplete(
                                                m._id
                                            )
                                        )
                                    )
                                })

                        const strokeColor = isComplete
                            ? color + '66'
                            : isActive || isFirst
                                ? color
                                : '#1a2a45'

                        const fillColor = isComplete
                            ? '#0d1f15'
                            : isActive || isFirst
                                ? color + '22'
                                : '#0d1526'

                        const textColor = isComplete
                            ? color
                            : isActive || isFirst
                                ? color
                                : '#2a3a55'

                        return (
                            <g
                                key={level._id}
                                onClick={() =>
                                    accessible &&
                                    setSelectedLevel(level)
                                }
                                style={{
                                    cursor: accessible
                                        ? 'pointer'
                                        : 'not-allowed'
                                }}
                            >
                                {(isActive || isFirst) &&
                                    !isComplete && (
                                        <rect
                                            x={pos.x - 4}
                                            y={pos.y - 4}
                                            width={
                                                NODE_SIZE + 8
                                            }
                                            height={
                                                NODE_SIZE + 8
                                            }
                                            rx="14"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="1"
                                            opacity="0.2"
                                        />
                                    )}

                                <rect
                                    x={pos.x}
                                    y={pos.y}
                                    width={NODE_SIZE}
                                    height={NODE_SIZE}
                                    rx="10"
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth="1.5"
                                />

                                <text
                                    x={
                                        pos.x +
                                        NODE_SIZE / 2
                                    }
                                    y={pos.y + 26}
                                    textAnchor="middle"
                                    fontSize="18"
                                    fill={textColor}
                                    fontFamily="monospace"
                                >
                                    {isComplete
                                        ? '✓'
                                        : accessible
                                            ? '◎'
                                            : '🔒'}
                                </text>

                                <text
                                    x={
                                        pos.x +
                                        NODE_SIZE / 2
                                    }
                                    y={pos.y + 46}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill={textColor}
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                >
                                    LVL {level.levelNumber}
                                </text>

                                <text
                                    x={
                                        pos.x +
                                        NODE_SIZE / 2
                                    }
                                    y={pos.y + 62}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill={textColor + '99'}
                                    fontFamily="monospace"
                                >
                                    {doneCount}/{total}
                                </text>

                                {/* Level title below node */}
                                <text
                                    x={
                                        pos.x +
                                        NODE_SIZE / 2
                                    }
                                    y={
                                        pos.y +
                                        NODE_SIZE +
                                        18
                                    }
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill={color + '88'}
                                    fontFamily="monospace"
                                >
                                    {level.title}
                                </text>
                            </g>
                        )
                    })}
                </svg>

                {/* Mission panel overlay */}
                {selectedLevel && (
                    <MissionPanel
                        level={selectedLevel}
                        missions={selectedMissions}
                        onClose={() =>
                            setSelectedLevel(null)
                        }
                        onStartLevel={(
                            missionId,
                            levelId,
                            missions
                        ) => {
                            setSelectedLevel(null)
                            onStartLevel(
                                missionId,
                                levelId,
                                missions
                            )
                        }}
                    />
                )}
            </div>
        </div>
    )
}