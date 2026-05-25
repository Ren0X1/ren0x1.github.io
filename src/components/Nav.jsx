import { Car, Shield, LogOut, Wrench, Users, Sun, Moon } from 'lucide-react'
import { theme, css, getThemeMode } from '../lib/theme.js'
import { useIsMobile } from '../lib/useIsMobile.js'
import NotificationCenter from './NotificationCenter.jsx'

export default function Nav({ user, view, setView, onLogout, dataVersion, onToggleTheme }) {
  const m = useIsMobile()
  const isDark = getThemeMode() === 'dark'
  const tabs = [
    { id: 'dashboard', icon: <Car size={16} />, label: 'Vehículos' },
    { id: 'groups', icon: <Users size={16} />, label: 'Grupos' },
    { id: 'workshops', icon: <Wrench size={16} />, label: 'Talleres' },
    ...(user.role === 'admin' ? [{ id: 'admin', icon: <Shield size={16} />, label: 'Admin' }] : []),
  ]
  return (
    <header style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ ...css.container, ...css.flexBetween, height: m ? 48 : 56 }}>
        <div style={{ ...css.flex, gap: m ? 8 : 12 }}>
          <Car size={m ? 20 : 22} color={theme.accent} />
          {!m && <span style={{ fontWeight: 800, fontSize: 17, color: isDark ? '#fff' : '#111', letterSpacing: -0.5 }}>Pibes Mecánicos</span>}
        </div>
        <div style={{ ...css.flex, gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              ...css.flex, gap: 5,
              background: view === t.id ? theme.accentSoft : 'transparent',
              color: view === t.id ? theme.accent : theme.muted,
              border: 'none', borderRadius: 8, padding: m ? '6px 10px' : '6px 14px',
              cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
            }}>{t.icon} {m ? null : t.label}</button>
          ))}
        </div>
        <div style={{ ...css.flex, gap: m ? 6 : 10 }}>
          <button onClick={onToggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex', padding: 4 }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NotificationCenter userId={user.id} isMobile={m} dataVersion={dataVersion} />
          {!m && <span style={{ fontSize: 13, color: theme.muted }}>{user.name}</span>}
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex' }}><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  )
}
