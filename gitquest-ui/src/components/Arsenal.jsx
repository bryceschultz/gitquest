import { useState, useEffect } from 'react'
import { useProgress } from '../context/ProgressContext'

const BASE_URL = import.meta.env.VITE_API_URL //
//const BASE_URL   = 'http://localhost:5001/api'
const CATEGORIES = ['all', 'boost', 'cosmetic', 'tool']
const CAT_LABELS = { all: 'ALL', boost: 'BOOSTS', cosmetic: 'COSMETICS', tool: 'TOOLS' }
const CAT_COLORS = {
  tool:     { bg: '#0a1220', border: '#1a3a6a',    text: '#4a8fcf' },
  boost:    { bg: '#0d1f15', border: '#00ff8833',  text: '#00cc66' },
  cosmetic: { bg: '#1a0808', border: '#e24b4a33',  text: '#e24b4a' },
}

function Tag({ type }) {
  const c = CAT_COLORS[type] || CAT_COLORS.tool
  return (
      <span style={{
        fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em',
        padding: '3px 8px', borderRadius: 4,
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      }}>
      {CAT_LABELS[type] || type.toUpperCase()}
    </span>
  )
}

function PurchaseToast({ name, emoji }) {
  return (
      <div style={{
        position: 'fixed', top: '4.5rem', right: '1rem', zIndex: 300,
        background: '#0d1526', border: '1px solid #00ff8866',
        borderLeft: '3px solid #00ff88',
        borderRadius: 8, padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'monospace', fontSize: 13,
        animation: 'fadeInUp 0.3s ease',
        boxShadow: '0 0 20px rgba(0,255,136,0.1)',
      }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <div>
          <div style={{ fontSize: 10, color: '#00ff88', letterSpacing: '0.1em', marginBottom: 2 }}>✔ ACQUIRED</div>
          <div style={{ color: '#c8daf0', fontWeight: 'bold' }}>{name}</div>
        </div>
      </div>
  )
}

export default function Collectible({ onBack }) {
  const { progress, addCoins }  = useProgress()
  const [items, setItems]       = useState([])
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [buying, setBuying]     = useState(null)
  const [using, setUsing]       = useState(null)
  const [toast, setToast]       = useState(null)
  const [balance, setBalance]   = useState(progress.coins ?? 0)

  useEffect(() => { setBalance(progress.coins ?? 0) }, [progress.coins])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${BASE_URL}/collectible`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to load collectibles')
        const { items: data } = await res.json()
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Purchase ───────────────────────────────────────────────
  async function handlePurchase(item) {
    if (item.owned || balance < item.coinCost || buying || using) return
    setBuying(item._id)
    try {
      const res = await fetch(`${BASE_URL}/collectible/${item._id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setItems(prev => prev.map(i =>
          i._id === item._id ? { ...i, owned: true, equipped: false } : i
      ))

      const deducted = data.remainingCoins
      setBalance(deducted)
      addCoins(deducted - balance)

      await new Promise(resolve => setTimeout(resolve, 2000))

      setToast({ name: item.name, emoji: item.emoji })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Purchase error:', err.message)
    } finally {
      setBuying(null)
    }
  }

  // ── Use / unequip ──────────────────────────────────────────
  async function handleUse(item) {
    if (!item.owned || item.equipped || using || buying) return
    setUsing(item._id)
    try {
      const res = await fetch(`${BASE_URL}/collectible/${item._id}/unequip`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to unequip item')
      const data = await res.json()

      setItems(prev => prev.map(i => {
        if (i._id !== item._id) return i
        // Consumable boosts get activated (stay owned, now equipped) rather
        // than removed — they're consumed later, on mission completion.
        return data.activated
            ? { ...i, owned: true, equipped: true }
            : { ...i, owned: false, equipped: false }
      }))

      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (err) {
      console.error('Use error:', err.message)
    } finally {
      setUsing(null)
    }
  }

  const visible = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {toast && <PurchaseToast name={toast.name} emoji={toast.emoji} />}

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #1a2a45', background: '#080c17', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ fontSize: 11, color: '#4a6fa5', background: 'none', border: '1px solid #1a2a45', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
            ← Back
          </button>
          <span style={{ fontSize: 11, color: '#4a6fa5', fontFamily: 'monospace', letterSpacing: '0.1em' }}>COLLECTIBLES</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 13 }}>
            <span style={{ color: '#4a6fa5', fontSize: 11 }}>BALANCE</span>
            <span style={{ color: '#ffb700', fontWeight: 500 }}>💰 {balance}</span>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', fontFamily: 'monospace', marginBottom: 6 }}>FIELD EQUIPMENT</div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#c8daf0', fontFamily: 'monospace', marginBottom: 6 }}>Collectibles</h1>
            <p style={{ fontSize: 13, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.6 }}>
              Spend your field coins on tools, boosts, and cosmetics. Press USE NOW to activate an item.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em',
                  padding: '5px 14px', borderRadius: 99, cursor: 'pointer',
                  background: filter === cat ? '#003322' : 'none',
                  border: `1px solid ${filter === cat ? '#00ff88' : '#1a2a45'}`,
                  color: filter === cat ? '#00ff88' : '#4a6fa5',
                  textTransform: 'uppercase',
                }}>
                  {CAT_LABELS[cat]}
                </button>
            ))}
          </div>

          {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#4a6fa5', fontFamily: 'monospace' }}>
                <div style={{ color: '#00ff88', marginBottom: 8 }}>◈ LOADING COLLECTIBLES...</div>
                <div style={{ fontSize: 11, color: '#2a3a55' }}>Fetching from HQ inventory</div>
              </div>
          )}

          {!loading && error && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#e24b4a', fontFamily: 'monospace' }}>✘ {error}</div>
          )}

          {!loading && !error && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
                {visible.map(item => {
                  const canAfford    = balance >= item.coinCost
                  const isPurchasing = buying === item._id
                  const isUsing      = using  === item._id
                  const borderColor  = item.owned
                      ? '#00ff8866'
                      : isPurchasing ? '#00ff88' : '#1a2a45'

                  return (
                      <div key={item._id} style={{
                        background:   item.owned ? '#0a1a10' : '#0d1526',
                        border:       `1px solid ${borderColor}`,
                        borderRadius: 10, padding: '1.25rem',
                        transition:   'border-color 0.3s',
                        display:      'flex', flexDirection: 'column', gap: 10,
                      }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{item.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: item.owned ? '#00ff88' : '#c8daf0', fontFamily: 'monospace', marginBottom: 3 }}>
                              {item.name}
                            </div>
                            <Tag type={item.type} />
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: 12, color: '#4a6fa5', fontFamily: 'monospace', lineHeight: 1.7, margin: 0 }}>
                          {item.description}
                        </p>

                        {/* Effect */}
                        {item.effect && (
                            <div style={{ fontSize: 11, color: '#2a3a55', fontFamily: 'monospace', fontStyle: 'italic' }}>
                              ◈ {item.effect}
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${item.owned ? '#00ff8822' : '#1a2a45'}` }}>
                    <span style={{
                      fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold',
                      color: item.owned ? '#00ff8877' : canAfford ? '#ffb700' : '#e24b4a',
                    }}>
                      {item.owned ? '✓ OWNED' : `💰 ${item.coinCost}`}
                    </span>

                          {item.owned ? (
                              item.equipped ? (
                                  // ACTIVE — already equipped, will be consumed on next mission
                                  <span style={{
                                    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
                                    padding: '6px 16px', borderRadius: 6,
                                    background: '#00220a',
                                    border: '1px solid #00ff8866',
                                    color: '#00ff88',
                                    minWidth: 90, textAlign: 'center',
                                  }}>
                                    ◈ ACTIVE
                                  </span>
                              ) : (
                                  // USE NOW button
                                  <button
                                      onClick={() => handleUse(item)}
                                      disabled={isUsing}
                                      style={{
                                        fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
                                        padding: '6px 16px', borderRadius: 6,
                                        cursor: isUsing ? 'not-allowed' : 'pointer',
                                        background: '#003322',
                                        border: '1px solid #00ff88',
                                        color: '#00ff88',
                                        minWidth: 90, textAlign: 'center',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 0 8px rgba(0,255,136,0.15)',
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#004d33' }}
                                      onMouseLeave={e => { e.currentTarget.style.background = '#003322' }}
                                  >
                                    {isUsing ? '...' : 'USE NOW'}
                                  </button>
                              )
                          ) : (
                              // PURCHASE / INSUFFICIENT button
                              <button
                                  onClick={() => handlePurchase(item)}
                                  disabled={!canAfford || !!buying || !!using}
                                  style={{
                                    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
                                    padding: '6px 16px', borderRadius: 6,
                                    cursor: !canAfford || buying || using ? 'not-allowed' : 'pointer',
                                    background: canAfford ? '#003322' : 'none',
                                    border: `1px solid ${canAfford ? '#00ff88' : '#e24b4a44'}`,
                                    color: canAfford ? '#00ff88' : '#e24b4a77',
                                    opacity: !canAfford ? 0.7 : 1,
                                    minWidth: 90, textAlign: 'center',
                                    transition: 'all 0.2s',
                                  }}
                              >
                                {isPurchasing ? '...' : canAfford ? 'PURCHASE' : 'INSUFFICIENT'}
                              </button>
                          )}
                        </div>
                      </div>
                  )
                })}
              </div>
          )}

          <div style={{ height: '3rem' }} />
        </div>

        <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      </div>
  )
}