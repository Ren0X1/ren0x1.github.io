import { useState } from 'react'
import { Car, Eye, EyeOff } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { login } from '../lib/supabase.js'
import { Field } from './ui.jsx'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !pin) return setError('Introduce usuario y PIN')
    setLoading(true)
    setError('')
    try {
      const user = await login(username, pin)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Usuario o PIN incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: theme.accentSoft, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Car size={40} color={theme.accent} />
          </div>
          <h1 style={{ ...css.h1, fontSize: 32, marginBottom: 6 }}>Pibes Mecánicos</h1>
          <p style={css.subtitle}>El taller de los pibes 🔧</p>
        </div>

        <div style={{ ...css.card, padding: 28 }}>
          <Field label="Usuario">
            <input
              style={css.input}
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="Usuario"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </Field>
          <Field label="PIN">
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...css.input, paddingRight: 40 }}
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                placeholder="••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: theme.muted, cursor: 'pointer',
                }}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {error && <p style={{ color: theme.red, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              ...css.btn(),
              width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
