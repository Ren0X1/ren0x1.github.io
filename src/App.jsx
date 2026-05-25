import { useState, useCallback } from 'react'
import { theme, getThemeMode, setThemeMode } from './lib/theme.js'
import { updateProfile } from './lib/supabase.js'
import { Toast, Modal, Field } from './components/ui.jsx'
import Login from './components/Login.jsx'
import Nav from './components/Nav.jsx'
import Dashboard from './components/Dashboard.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Workshops from './components/Workshops.jsx'
import Groups from './components/Groups.jsx'

function PinChangeModal({ user, onDone }) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (pin.length < 4) return setError('El PIN debe tener al menos 4 dígitos')
    if (pin !== confirm) return setError('Los PINs no coinciden')
    setSaving(true)
    try {
      await updateProfile(user.id, { pin, pin_change_required: false })
      onDone({ ...user, pin, pin_change_required: false })
    } catch (err) { setError('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 6 }}>🔒 Cambiar PIN</h2>
          <p style={{ fontSize: 13, color: theme.muted, marginBottom: 20 }}>
            Es tu primer inicio de sesión. Por seguridad, elige un nuevo PIN.
          </p>
          <Field label="Nuevo PIN">
            <input style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              inputMode="numeric" pattern="[0-9]*" type="password" value={pin}
              onChange={e => { setPin(e.target.value.replace(/[^\d]/g, '')); setError('') }}
              placeholder="Mínimo 4 dígitos" />
          </Field>
          <Field label="Confirmar PIN">
            <input style={{ background: theme.input, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              inputMode="numeric" pattern="[0-9]*" type="password" value={confirm}
              onChange={e => { setConfirm(e.target.value.replace(/[^\d]/g, '')); setError('') }}
              placeholder="Repite el PIN"
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
          </Field>
          {error && <p style={{ color: theme.red, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
          <button onClick={handleSave} disabled={saving} style={{
            background: theme.accent, color: '#000', border: 'none', borderRadius: 8,
            padding: '11px 16px', width: '100%', fontWeight: 600, cursor: 'pointer',
            fontSize: 14, fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Guardando...' : 'Guardar nuevo PIN'}</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = sessionStorage.getItem('pm_user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [view, setView] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [themeKey, setThemeKey] = useState(0)

  const handleLogin = (user) => {
    setCurrentUser(user); setView('dashboard')
    try { sessionStorage.setItem('pm_user', JSON.stringify(user)) } catch {}
  }
  const handleLogout = () => {
    setCurrentUser(null); setView('dashboard')
    try { sessionStorage.removeItem('pm_user') } catch {}
  }
  const onToast = useCallback((message, type = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3500)
    if (type === 'success') setDataVersion(v => v + 1)
  }, [])

  const toggleTheme = () => {
    setThemeMode(getThemeMode() === 'dark' ? 'light' : 'dark')
    setThemeKey(k => k + 1) // Force full re-render
  }

  if (!currentUser) return <Login onLogin={handleLogin} />

  // PIN change required
  if (currentUser.pin_change_required) {
    return <PinChangeModal user={currentUser} onDone={(updated) => {
      setCurrentUser(updated)
      try { sessionStorage.setItem('pm_user', JSON.stringify(updated)) } catch {}
    }} />
  }

  return (
    <div key={themeKey} style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontSize: 14, transition: 'background .3s, color .3s' }}>
      <Nav user={currentUser} view={view} setView={setView} onLogout={handleLogout} dataVersion={dataVersion} onToggleTheme={toggleTheme} />
      {view === 'dashboard' && <Dashboard user={currentUser} onToast={onToast} />}
      {view === 'groups' && <Groups user={currentUser} onToast={onToast} />}
      {view === 'workshops' && <Workshops user={currentUser} onToast={onToast} />}
      {view === 'admin' && currentUser.role === 'admin' && <AdminPanel onToast={onToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
