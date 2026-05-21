export const theme = {
  bg: '#0b0b12', card: '#12121d', cardHover: '#181828', border: '#1e1e32',
  accent: '#f59e0b', accentHover: '#d97706', accentSoft: 'rgba(245,158,11,0.12)',
  text: '#e2e8f0', muted: '#7a7f9a', mutedLight: '#4a4f6a',
  green: '#22c55e', greenSoft: 'rgba(34,197,94,0.12)',
  yellow: '#eab308', yellowSoft: 'rgba(234,179,8,0.12)',
  red: '#ef4444', redSoft: 'rgba(239,68,68,0.12)',
  input: '#0f0f1a', white: '#ffffff',
}

export const css = {
  container: { maxWidth: 960, margin: '0 auto', padding: '0 16px' },
  flex: { display: 'flex', alignItems: 'center', gap: 8 },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  card: { background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 20, marginBottom: 12 },
  btn: (bg = theme.accent, color = '#000') => ({
    background: bg, color, border: 'none', borderRadius: 8, padding: '8px 16px',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    gap: 6, fontSize: 13, transition: 'all .15s', fontFamily: 'inherit',
  }),
  btnSm: (bg = theme.accent, color = '#000') => ({
    background: bg, color, border: 'none', borderRadius: 6, padding: '5px 10px',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    gap: 4, fontSize: 12, fontFamily: 'inherit',
  }),
  btnOutline: {
    background: 'transparent', color: theme.muted, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit',
  },
  input: {
    background: theme.input, color: theme.text, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    background: theme.input, color: theme.text, border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '9px 12px', width: '100%', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  label: {
    display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600,
    color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  h1: { fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0, color: theme.white },
  h2: { fontSize: 20, fontWeight: 700, letterSpacing: -0.3, margin: 0, color: theme.white },
  h3: { fontSize: 16, fontWeight: 700, margin: 0, color: theme.white },
  subtitle: { fontSize: 13, color: theme.muted, margin: 0 },
  badge: (bg, color) => ({
    background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 11,
    fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4,
  }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  modal: {
    background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`,
    padding: 24, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto',
  },
  th: {
    padding: '10px 14px', textAlign: 'left', color: theme.muted,
    fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  td: { padding: '10px 14px' },
}
