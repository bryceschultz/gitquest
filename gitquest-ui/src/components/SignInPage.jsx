import {useState} from 'react'
import {signIn} from '../../api/auth.js'

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
 * @param param0.label
 * @param param0.type
 * @param param0.value
 * @param param0.onChange
 * @param param0.placeholder
 * @param param0.error
 * @returns {JSX.Element}
 * @constructor
 */
function InputField({ label, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', color: '#4a6fa5', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#080c17',
          border: `1px solid ${error ? '#e24b4a' : focused ? '#00ff88' : '#1a2a45'}`,
          borderRadius: 6,
          padding: '10px 14px',
          fontSize: 13,
          color: '#c8daf0',
          fontFamily: 'monospace',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
      />
      {error && (
        <div style={{ fontSize: 11, color: '#e24b4a', marginTop: 4 }}>{error}</div>
      )}
    </div>
  )
}

function SignInPage({ onSignIn, onGoToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  async function handleSubmit(ev) {
      ev.preventDefault()
      const e = validate()
      if (Object.keys(e).length) { setErrors(e); return }
      setErrors({})
      setLoading(true)
      try {
          const agent = await signIn(email, password)
          onSignIn(agent)
      } catch (err) {
          setErrors({ api: err.message })
      } finally {
          setLoading(false)
      }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', minHeight: '100vh',
    }}>
      {/* Status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11,
        letterSpacing: '0.12em', color: '#00ff88', border: '1px solid #00ff8844',
        borderRadius: 4, padding: '5px 14px', marginBottom: '1.5rem',
      }}>
        <PulseDot /> SECURE CHANNEL ACTIVE
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 500, color: '#e8f4fd', textAlign: 'center', marginBottom: 4, fontFamily: 'monospace' }}>
        Git<span style={{ color: '#00ff88' }}>Quest</span>
      </h1>
      <p style={{ fontSize: 12, color: '#4a6fa5', marginBottom: '2rem', letterSpacing: '0.1em' }}>
        AGENT AUTHENTICATION REQUIRED
      </p>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#0d1526', border: '1px solid #1a2a45',
        borderRadius: 12, padding: '2rem',
      }}>
        <div style={{ fontSize: 13, color: '#00ff88', marginBottom: '1.5rem', letterSpacing: '0.08em' }}>
          SIGN IN
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="EMAIL"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="agent@gitquest.io"
            error={errors.email}
          />
          <InputField
            label="PASSWORD"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
          />

            {errors.api && (
                <div style={{
                    fontSize: 12, color: '#e24b4a',
                    background: '#e24b4a11', border: '1px solid #e24b4a44',
                    borderRadius: 6, padding: '8px 12px', marginBottom: 12,
                    letterSpacing: '0.05em',
                }}>
                    ✘ {errors.api}
                </div>
            )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', marginTop: 8,
              background: loading ? '#00cc6633' : '#00ff8822',
              border: `1px solid ${loading ? '#00cc6655' : '#00ff88'}`,
              borderRadius: 6, color: '#00ff88', fontSize: 13,
              fontFamily: 'monospace', letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00ff8833' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00ff8822' }}
          >
            {loading ? 'AUTHENTICATING...' : '▶ ACCESS GRANTED'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #1a2a45', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#4a6fa5' }}>New recruit? </span>
          <button
            onClick={onGoToSignUp}
            style={{
              background: 'none', border: 'none', color: '#00ff88', fontSize: 12,
              fontFamily: 'monospace', cursor: 'pointer', padding: 0, textDecoration: 'underline',
            }}
          >
            Request clearance
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2a3a55', marginTop: '1.5rem' }}>
        ℹ Encrypted connection · TLS 1.3
      </div>
    </div>
  )
}

export default SignInPage
