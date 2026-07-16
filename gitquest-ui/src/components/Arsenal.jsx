import { useState } from 'react'
import { useProgress } from '../context/useProgress'
import { coinBalance } from '../game/stats'

const CATEGORIES = ['all', 'tools', 'cosmetics']

// Purchases are persisted in shared progress state and coins are earned by
// completing lessons (10/lesson + 25/mission). Items marked `effect: true`
// change gameplay (wired into the battle field). The rest are cosmetic
// prototypes and say so — the full economy is documented future scope.
const ITEMS = [
  {
    id: 1, category: 'tools', effect: true,
    name: 'Auto-hint Module',
    desc: 'Reveals the hint after your first wrong attempt instead of your second.',
    cost: 30, icon: '⚡',
  },
  {
    id: 3, category: 'tools', effect: true,
    name: 'Ghost Command',
    desc: 'After a wrong attempt, shows a faded version of the correct command. You still have to type it yourself.',
    cost: 80, icon: '👻',
  },
  {
    id: 7, category: 'cosmetics', effect: false,
    name: 'Red Alert Theme',
    desc: 'Cosmetic prototype — no effect yet. Planned: switches the UI accent from green to red.',
    cost: 100, icon: '🔴',
  },
  {
    id: 8, category: 'cosmetics', effect: false,
    name: 'Agent Callsign',
    desc: 'Cosmetic prototype — no effect yet. Planned: custom callsign in the topbar.',
    cost: 60, icon: '🪪',
  },
]

function Tag({ color, children }) {
  const palette = {
    blue: { color: '#4a6fa5', border: '#1a2a45' },
    green: { color: '#00cc66', border: '#00ff8833' },
    red: { color: '#e24b4a', border: '#e24b4a33' },
  }
  const p = palette[color] ?? palette.blue
  return (
    <span style={{ fontSize: 9, letterSpacing: '0.1em', color: p.color, border: `1px solid ${p.border}`, borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

export default function Arsenal({ onBack }) {
  const { progress, purchaseItem, ownsItem } = useProgress()
  const [category, setCategory] = useState('all')
  const [flash, setFlash] = useState(null)

  const balance = coinBalance(progress)
  const visible = ITEMS.filter(i => category === 'all' || i.category === category)

  const handleBuy = (item) => {
    if (purchaseItem(item.id, item.cost)) {
      setFlash(item.id)
      setTimeout(() => setFlash(null), 600)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
          ← back
        </button>
        <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ARSENAL</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#c8daf0', fontFamily: 'monospace' }} title="Coins are earned by completing lessons and missions">💰 {balance}</span>
      </div>

      <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ fontSize: 12, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Earn coins by completing lessons (+10) and missions (+25 bonus). Purchases persist between sessions.
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em',
                padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                background: category === cat ? '#003322' : 'none',
                border: `1px solid ${category === cat ? '#00ff88' : '#1a2a45'}`,
                color: category === cat ? '#00ff88' : '#4a6fa5',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {visible.map(item => {
            const owned = ownsItem(item.id)
            const canAfford = balance >= item.cost
            const justBought = flash === item.id
            return (
              <div key={item.id} style={{
                background: owned ? '#0d1f15' : '#0d1526',
                border: `1px solid ${justBought ? '#00ff88' : owned ? '#00ff8833' : '#1a2a45'}`,
                borderRadius: 10, padding: '1.25rem',
                transition: 'border-color 0.3s',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: owned ? '#00cc66' : '#c8daf0', fontFamily: 'monospace', marginBottom: 3 }}>{item.name}</div>
                      <Tag color={item.category === 'tools' ? 'green' : 'red'}>
                        {item.category}
                      </Tag>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>
                  {item.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', color: owned ? '#4a6fa5' : canAfford ? '#c8daf0' : '#e24b4a' }}>
                    {owned ? '—' : `💰 ${item.cost}`}
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={owned || !canAfford}
                    style={{
                      fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
                      padding: '6px 14px', borderRadius: 6, cursor: owned || !canAfford ? 'not-allowed' : 'pointer',
                      background: owned ? 'none' : canAfford ? '#003322' : 'none',
                      border: `1px solid ${owned ? '#00ff8833' : canAfford ? '#00ff88' : '#e24b4a44'}`,
                      color: owned ? '#00ff8877' : canAfford ? '#00ff88' : '#e24b4a77',
                      opacity: owned || !canAfford ? 0.7 : 1,
                    }}
                  >
                    {owned ? '✓ EQUIPPED' : canAfford ? 'ACQUIRE' : 'INSUFFICIENT'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '3rem' }} />
      </div>
    </div>
  )
}
