import { useState, useCallback } from 'react'
import { theme } from './lib/theme.js'
import { Toast } from './components/ui.jsx'
import Login from './components/Login.jsx'
import Nav from './components/Nav.jsx'
import Dashboard from './components/Dashboard.jsx'
import AdminPanel from './components/AdminPanel.jsx'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = sessionStorage.getItem('pm_user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [view, setView] = useState('dashboard')
  const [toast, setToast] = useState(null)

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
  }, [])

  if (!currentUser) return <Login onLogin={handleLogin} />

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.text, fontSize: 14 }}>
      <Nav user={currentUser} view={view} setView={setView} onLogout={handleLogout} />
      {view === 'dashboard' && <Dashboard user={currentUser} onToast={onToast} />}
      {view === 'admin' && currentUser.role === 'admin' && <AdminPanel onToast={onToast} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
