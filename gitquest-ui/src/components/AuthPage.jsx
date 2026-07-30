import { useState } from 'react'
import { signIn, signUp } from '../api'
import { useProgress } from '../context/useProgress'

// Optional account gate — rendered only when the app is built with
// VITE_API_URL (the dynamic, database-backed deployment). Adapted from
// Anas's PR #12 SignInPage/SignUpPage, restyled to the app theme and
// reduced to one component. Guest play is always available; signing in
// adds cross-device persistence via the backend, nothing else.
const FIELD = {
  width: '100%', background: '#080c17', border: '1px solid #1a2a45',
  borderRadius: 8, padding: '10px 12px', color: '#c8daf0',
  fontFamily: 'monospace', fontSize: 13, marginBottom: 10, boxSizing: 'border-box',
}

export default function AuthPage({ onDone }) {
  const { adoptAgent } = useProgress()
  const [mode, setMode] = useState('signin')
  const [codename, setCodename] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    setBusy(true); setError(null)
    try {
      const data = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(codename.trim(), email, password)
      await adoptAgent(data.agent)
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#0d1526', border: '1px solid #1a2a45', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 380 }}>
        <div style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          {mode === 'signin' ? '◎ AGENT SIGN-IN' : '◎ AGENT REGISTRATION'}
        </div>
        <div style={{ color: '#4a6fa5', fontFamily: 'monospace', fontSize: 11, marginBottom: 18 }}>
          Optional — an account syncs your progress to HQ so it follows you across devices.
        </div>
        {mode === 'signup' && (
          <input style={FIELD} placeholder="codename (no spaces)" value={codename}
            onChange={e => setCodename(e.target.value)} aria-label="codename" />
        )}
        <input style={FIELD} placeholder="email" type="email" value={email}
          onChange={e => setEmail(e.target.value)} aria-label="email" />
        <input style={FIELD} placeholder="password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} aria-label="password"
          onKeyDown={e => { if (e.key === 'Enter' && !busy) submit() }} />
        {error && (
          <div style={{ color: '#ff5f56', fontFamily: 'monospace', fontSize: 11, marginBottom: 10 }}>✗ {error}</div>
        )}
        <button onClick={submit} disabled={busy} style={{
          width: '100%', background: '#003322', border: '1px solid #00ff88', color: '#00ff88',
          borderRadius: 8, padding: '10px', fontFamily: 'monospace', fontSize: 13, cursor: 'pointer', marginBottom: 10,
        }}>
          {busy ? '…' : mode === 'signin' ? '▶ Sign in' : '▶ Create account'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 11 }}>
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
            style={{ background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', padding: 0 }}>
            {mode === 'signin' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
          <button onClick={onDone}
            style={{ background: 'none', border: 'none', color: '#4a6fa5', cursor: 'pointer', padding: 0 }}>
            Continue as guest →
          </button>
        </div>
      </div>
    </div>
  )
}
