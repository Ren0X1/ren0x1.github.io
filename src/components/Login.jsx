import { useState, useEffect } from 'react'
import { Car, Eye, EyeOff, Lock } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { login } from '../lib/supabase.js'
import { Field } from './ui.jsx'

function getLockout() {
  try {
    const raw = sessionStorage.getItem('pm_lockout')
    if (!raw) return { fails: 0, until: 0 }
    return JSON.parse(raw)
  } catch { return { fails: 0, until: 0 } }
}

function setLockout(data) {
  try { sessionStorage.setItem('pm_lockout', JSON.stringify(data)) } catch {}
}

function getTimeout(fails) {
  if (fails < 3) return 0
  if (fails === 3) return 30
  if (fails === 4) return 60
  return 300 // 5 min max
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Check lockout on mount
  useEffect(() => {
    const lock = getLockout()
    const remaining = Math.ceil((lock.until - Date.now()) / 1000)
    if (remaining > 0) setCountdown(remaining)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleLogin = async () => {
    if (countdown > 0) return
    if (!username || !pin) return setError('Introduce usuario y PIN')
    setLoading(true)
    setError('')
    try {
      const user = await login(username, pin)
      setLockout({ fails: 0, until: 0 }) // Reset on success
      onLogin(user)
    } catch (err) {
      const lock = getLockout()
      const newFails = lock.fails + 1
      const timeout = getTimeout(newFails)
      const until = timeout > 0 ? Date.now() + timeout * 1000 : 0
      setLockout({ fails: newFails, until })
      if (timeout > 0) {
        setCountdown(timeout)
        setError(`Demasiados intentos. Espera ${timeout >= 60 ? `${Math.floor(timeout/60)} min` : `${timeout}s`}`)
      } else {
        setError(err.message || 'Usuario o PIN incorrecto')
      }
    } finally {
      setLoading(false)
    }
  }

  const locked = countdown > 0
  const formatCountdown = () => {
    const m = Math.floor(countdown / 60)
    const s = countdown % 60
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: theme.accentSoft, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Car size={40} color={theme.accent} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: theme.text, marginBottom: 6 }}>Pibes Mecánicos</h1>
          <p style={{ fontSize: 13, color: theme.muted }}>El taller de los pibes 🔧</p>
        </div>

        <div style={{ background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 28 }}>
          <Field label="Usuario">
            <input style={css.input} value={username} disabled={locked}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Usuario"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </Field>
          <Field label="PIN">
            <div style={{ position: 'relative' }}>
              <input style={{ ...css.input, paddingRight: 40 }}
                type={showPin ? 'text' : 'password'} inputMode="numeric" pattern="[0-9]*"
                autoComplete="one-time-code" value={pin} disabled={locked}
                onChange={e => { setPin(e.target.value.replace(/[^\d]/g, '')); setError('') }}
                placeholder="••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <button onClick={() => setShowPin(!showPin)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {error && <p style={{ color: theme.red, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

          {locked ? (
            <div style={{ background: theme.redSoft, borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
              <Lock size={18} color={theme.red} style={{ marginBottom: 4 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: theme.red }}>
                Bloqueado — {formatCountdown()}
              </p>
            </div>
          ) : (
            <button onClick={handleLogin} disabled={loading}
              style={{ background: theme.accent, color: '#000', border: 'none', borderRadius: 8, padding: '11px 16px', width: '100%', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}