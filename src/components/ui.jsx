import { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertTriangle, X } from 'lucide-react'
import { theme, css } from '../lib/theme.js'

export function StatusBadge({ status }) {
  if (status === 'ok') return <span style={css.badge(theme.greenSoft, theme.green)}><CheckCircle size={12} /> OK</span>
  if (status === 'warn') return <span style={css.badge(theme.yellowSoft, theme.yellow)}><Clock size={12} /> Próximo</span>
  return <span style={css.badge(theme.redSoft, theme.red)}><AlertTriangle size={12} /> Vencido</span>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  const isMobile = window.innerWidth < 640
  return (
    <div style={css.overlay} onClick={onClose}>
      <div style={{
        ...css.modal,
        ...(isMobile ? { maxWidth: '100%', maxHeight: '95vh', borderRadius: 12, margin: 8, padding: 16 } : {}),
      }} onClick={e => e.stopPropagation()}>
        <div style={{ ...css.flexBetween, marginBottom: 16 }}>
          <h3 style={{ ...css.h2, fontSize: isMobile ? 17 : 20 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ResponsiveGrid2({ children }) {
  const isMobile = window.innerWidth < 640
  return <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>{children}</div>
}

export function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={css.label}>{label}</label>{children}</div>
}

export function Stat({ icon, label, value, color }) {
  return (
    <div style={{ ...css.card, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0 }}>
      <div style={{ background: theme.accentSoft, borderRadius: 10, padding: 8, display: 'flex' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: color || theme.white }}>{value}</div>
      </div>
    </div>
  )
}

export function Loader({ text = 'Cargando...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: theme.muted }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${theme.border}`, borderTop: `3px solid ${theme.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontSize: 13 }}>{text}</p>
      </div>
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  const color = type === 'error' ? theme.red : theme.green
  const isMobile = window.innerWidth < 640
  return (
    <div style={{
      position: 'fixed', bottom: isMobile ? 16 : 24, zIndex: 2000,
      ...(isMobile ? { left: 16, right: 16 } : { right: 24 }),
      background: theme.card, border: `1px solid ${color}`,
      borderRadius: 10, padding: '12px 16px', display: 'flex',
      alignItems: 'center', gap: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <span style={{ fontSize: 13, color, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}><X size={14} /></button>
    </div>
  )
}

export function DateInput({ value, onChange, style: s, ...props }) {
  const toDisplay = (iso) => {
    if (!iso) return ''
    const p = iso.split('-')
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : ''
  }
  const [text, setText] = useState(toDisplay(value))

  useEffect(() => { setText(toDisplay(value)) }, [value])

  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^\d]/g, '')
    if (raw.length > 8) raw = raw.slice(0, 8)
    let display = raw
    if (raw.length > 2) display = raw.slice(0, 2) + '/' + raw.slice(2)
    if (raw.length > 4) display = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4)
    setText(display)
    if (raw.length === 8) {
      const iso = `${raw.slice(4)}-${raw.slice(2, 4)}-${raw.slice(0, 2)}`
      onChange({ target: { value: iso } })
    }
  }

  return <input type="text" inputMode="numeric" placeholder="DD/MM/AAAA"
    value={text} onChange={handleChange} style={{ ...css.input, ...s }} {...props} />
}

export function NumInput({ value, onChange, step, style: s, ...props }) {
  const [text, setText] = useState(value != null && value !== 0 ? String(value) : '')

  useEffect(() => {
    setText(value != null && value !== 0 ? String(value) : '')
  }, [value])

  const handleChange = (e) => {
    const v = e.target.value
    setText(v)
    const num = v === '' ? 0 : parseFloat(v)
    if (!isNaN(num)) onChange({ target: { value: num } })
  }

  return <input type="number" step={step} value={text} onChange={handleChange}
    onFocus={e => { if (e.target.value === '0') { setText(''); } }}
    placeholder="0" style={{ ...css.input, ...s }} {...props} />
}
