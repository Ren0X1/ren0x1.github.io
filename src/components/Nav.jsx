import { Car, Shield, LogOut, Wrench, Users, Sun, Moon, BarChart3, Bell } from 'lucide-react'
import { theme, css, getThemeMode } from '../lib/theme.js'
import { useIsMobile } from '../lib/useIsMobile.js'
import NotificationCenter from './NotificationCenter.jsx'

export default function Nav({ user, view, setView, onLogout, dataVersion, onToggleTheme }) {
  const m = useIsMobile()
  const isDark = getThemeMode() === 'dark'
  const tabs = [
    { id: 'dashboard', icon: <Car size={m ? 22 : 16} />, label: 'Vehículos' },
    { id: 'stats', icon: <BarChart3 size={m ? 22 : 16} />, label: 'Resumen' },
    { id: 'reminders', icon: <Bell size={m ? 22 : 16} />, label: 'Recordat.' },
    { id: 'groups', icon: <Users size={m ? 22 : 16} />, label: 'Grupos' },
    { id: 'workshops', icon: <Wrench size={m ? 22 : 16} />, label: 'Talleres' },
    ...(user.role === 'admin' ? [{ id: 'admin', icon: <Shield size={m ? 22 : 16} />, label: 'Admin' }] : []),
  ]

  // ─── MOBILE: Top bar (compact) + Bottom nav ───
  if (m) {
    return (
      <>
        {/* Top bar */}
        <header style={{
          background: theme.card, borderBottom: `1px solid ${theme.border}`,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ ...css.container, ...css.flexBetween, height: 52, padding: '0 14px' }}>
            <div style={{ ...css.flex, gap: 8 }}>
              <Car size={22} color={theme.accent} />
              <span style={{ fontWeight: 800, fontSize: 16, color: isDark ? '#fff' : '#111', letterSpacing: -0.3 }}>Pibes Mecánicos</span>
            </div>
            <div style={{ ...css.flex, gap: 10 }}>
              <button onClick={onToggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'}
                style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex', padding: 6 }}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <NotificationCenter userId={user.id} isMobile={m} dataVersion={dataVersion} />
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex', padding: 6 }}>
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Bottom navigation */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: theme.card, borderTop: `1px solid ${theme.border}`,
          display: 'flex', justifyContent: 'space-around',
          padding: '6px 4px 8px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 8px)',
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'transparent',
              color: view === t.id ? theme.accent : theme.muted,
              border: 'none', borderRadius: 8, padding: '6px 8px',
              cursor: 'pointer', fontWeight: 600, fontSize: 10, fontFamily: 'inherit',
              flex: 1, minWidth: 0,
              transition: 'all .15s',
            }}>
              <div style={{
                background: view === t.id ? theme.accentSoft : 'transparent',
                borderRadius: 8, padding: '4px 12px',
              }}>{t.icon}</div>
              <span style={{ fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                {t.label}
              </span>
            </button>
          ))}
        </nav>
      </>
    )
  }

  // ─── DESKTOP: Single top bar (original) ───
  return (
    <header style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ ...css.container, ...css.flexBetween, height: 56 }}>
        <div style={{ ...css.flex, gap: 12 }}>
          <Car size={22} color={theme.accent} />
          <span style={{ fontWeight: 800, fontSize: 17, color: isDark ? '#fff' : '#111', letterSpacing: -0.5 }}>Pibes Mecánicos</span>
        </div>
        <div style={{ ...css.flex, gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              ...css.flex, gap: 5,
              background: view === t.id ? theme.accentSoft : 'transparent',
              color: view === t.id ? theme.accent : theme.muted,
              border: 'none', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
        <div style={{ ...css.flex, gap: 10 }}>
          <button onClick={onToggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex', padding: 4 }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <NotificationCenter userId={user.id} isMobile={m} dataVersion={dataVersion} />
          <span style={{ fontSize: 13, color: theme.muted }}>{user.name}</span>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', display: 'flex' }}><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  )
}
