import { CheckCircle, Clock, AlertTriangle, X } from 'lucide-react'
import { theme, css } from '../lib/theme.js'

export function StatusBadge({ status }) {
  if (status === 'ok') return <span style={css.badge(theme.greenSoft, theme.green)}><CheckCircle size={12} /> OK</span>
  if (status === 'warn') return <span style={css.badge(theme.yellowSoft, theme.yellow)}><Clock size={12} /> Próximo</span>
  return <span style={css.badge(theme.redSoft, theme.red)}><AlertTriangle size={12} /> Vencido</span>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={css.overlay} onClick={onClose}>
      <div style={css.modal} onClick={e => e.stopPropagation()}>
        <div style={{ ...css.flexBetween, marginBottom: 20 }}>
          <h3 style={css.h2}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={css.label}>{label}</label>{children}</div>
}

export function Stat({ icon, label, value, color }) {
  return (
    <div style={{ ...css.card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
      <div style={{ background: theme.accentSoft, borderRadius: 10, padding: 10, display: 'flex' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: color || theme.white }}>{value}</div>
      </div>
    </div>
  )
}

export function Loader({ text = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.muted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 32, height: 32, border: `3px solid ${theme.border}`,
          borderTop: `3px solid ${theme.accent}`, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 13 }}>{text}</p>
      </div>
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  const bg = type === 'error' ? theme.redSoft : theme.greenSoft
  const color = type === 'error' ? theme.red : theme.green
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: theme.card, border: `1px solid ${color}`,
      borderRadius: 10, padding: '12px 20px', display: 'flex',
      alignItems: 'center', gap: 10, boxShadow: `0 4px 24px rgba(0,0,0,0.5)`,
    }}>
      <span style={{ fontSize: 13, color }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
        <X size={14} />
      </button>
    </div>
  )
}
