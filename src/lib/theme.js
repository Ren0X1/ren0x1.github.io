// ─── Dark & Light color palettes ───

const dark = {
  bg: '#161616', card: '#1d1d1d', cardHover: '#2c2c2c', border: '#303030',
  accent: '#f59e0b', accentHover: '#d97706', accentSoft: 'rgba(245,158,11,0.12)',
  text: '#e2e8f0', muted: '#999999', mutedLight: '#6d6d6d',
  green: '#22c55e', greenSoft: 'rgba(34,197,94,0.12)',
  yellow: '#eab308', yellowSoft: 'rgba(234,179,8,0.12)',
  red: '#ef4444', redSoft: 'rgba(239,68,68,0.12)',
  input: '#141414', white: '#ffffff',
}

const light = {
  bg: '#f3f4f6', card: '#ffffff', cardHover: '#f9fafb', border: '#e5e7eb',
  accent: '#2563eb', accentHover: '#1d4ed8', accentSoft: 'rgba(37,99,235,0.1)',
  text: '#111827', muted: '#6b7280', mutedLight: '#9ca3af',
  green: '#16a34a', greenSoft: 'rgba(22,163,74,0.1)',
  yellow: '#ca8a04', yellowSoft: 'rgba(202,138,4,0.1)',
  red: '#dc2626', redSoft: 'rgba(220,38,38,0.1)',
  input: '#f9fafb', white: '#ffffff',
}

// ─── Reactive theme via Proxy ───

let mode = 'dark'
try { mode = localStorage.getItem('pm_theme') || 'dark' } catch {}

export const theme = new Proxy({}, {
  get(_, prop) { return (mode === 'light' ? light : dark)[prop] }
})

export function getThemeMode() { return mode }
export function setThemeMode(m) {
  mode = m
  try { localStorage.setItem('pm_theme', m) } catch {}
  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = m === 'light' ? light.bg : dark.bg
}

// ─── CSS helpers (getters — always read live theme) ───

export const css = {
  get container() { return { maxWidth: 960, margin: '0 auto', padding: '0 16px' } },
  get flex() { return { display: 'flex', alignItems: 'center', gap: 8 } },
  get flexBetween() { return { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
  get card() { return { background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20, marginBottom: 12 } },
  btn(bg, color) {
    return {
      background: bg || theme.accent, color: color || '#000', border: 'none', borderRadius: 8,
      padding: '8px 16px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
      alignItems: 'center', gap: 6, fontSize: 13, transition: 'all .15s', fontFamily: 'inherit',
    }
  },
  btnSm(bg, color) {
    return {
      background: bg || theme.accent, color: color || '#000', border: 'none', borderRadius: 6,
      padding: '5px 10px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
      alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'inherit',
    }
  },
  get btnOutline() {
    return {
      background: 'transparent', color: theme.muted, border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit',
    }
  },
  get input() {
    return {
      background: theme.input, color: theme.text, border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13,
      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    }
  },
  get select() {
    return {
      background: theme.input, color: theme.text, border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13,
      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    }
  },
  get label() {
    return {
      display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600,
      color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5,
    }
  },
  get h1() { return { fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0, color: theme.white === '#ffffff' && mode === 'light' ? '#111827' : theme.white } },
  get h2() { return { fontSize: 20, fontWeight: 700, letterSpacing: -0.3, margin: 0, color: theme.white === '#ffffff' && mode === 'light' ? '#111827' : theme.white } },
  get h3() { return { fontSize: 16, fontWeight: 700, margin: 0, color: theme.white === '#ffffff' && mode === 'light' ? '#111827' : theme.white } },
  get subtitle() { return { fontSize: 13, color: theme.muted, margin: 0 } },
  badge(bg, color) { return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 } },
  get grid2() { return { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
  get overlay() { return { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } },
  get modal() { return { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' } },
  get th() { return { padding: '10px 14px', textAlign: 'left', color: theme.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 } },
  get td() { return { padding: '10px 14px' } },
}
