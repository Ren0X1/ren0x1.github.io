export const MAINT_TYPES = [
  { id: 'aceite', name: 'Aceite Motor', emoji: '🛢️', defKm: 10000, defMonths: 12 },
  { id: 'filtro_aceite', name: 'Filtro de Aceite', emoji: '🔧', defKm: 10000, defMonths: 12 },
  { id: 'filtro_aire', name: 'Filtro de Aire', emoji: '💨', defKm: 20000, defMonths: 24 },
  { id: 'filtro_habitaculo', name: 'Filtro Habitáculo', emoji: '🌬️', defKm: 15000, defMonths: 12 },
  { id: 'pastillas_del', name: 'Pastillas Freno Del.', emoji: '🛑', defKm: 40000, defMonths: 48 },
  { id: 'pastillas_tras', name: 'Pastillas Freno Tras.', emoji: '🛑', defKm: 50000, defMonths: 60 },
  { id: 'discos_freno', name: 'Discos de Freno', emoji: '💿', defKm: 70000, defMonths: 72 },
  { id: 'neumaticos', name: 'Neumáticos', emoji: '⭕', defKm: 45000, defMonths: 60 },
  { id: 'correa_dist', name: 'Correa Distribución', emoji: '⛓️', defKm: 120000, defMonths: 60 },
  { id: 'liquido_frenos', name: 'Líquido de Frenos', emoji: '💧', defKm: 40000, defMonths: 24 },
  { id: 'refrigerante', name: 'Refrigerante', emoji: '❄️', defKm: 50000, defMonths: 24 },
  { id: 'bujias', name: 'Bujías', emoji: '⚡', defKm: 40000, defMonths: 48 },
  { id: 'diferencial', name: 'Aceite Diferencial', emoji: '⚙️', defKm: 60000, defMonths: 60 },
  { id: 'caja_cambios', name: 'Aceite Caja Cambios', emoji: '🔄', defKm: 60000, defMonths: 60 },
  { id: 'embrague', name: 'Embrague', emoji: '🦶', defKm: 120000, defMonths: 0 },
  { id: 'bateria', name: 'Batería', emoji: '🔋', defKm: 60000, defMonths: 48 },
  { id: 'amortiguadores', name: 'Amortiguadores', emoji: '🔽', defKm: 80000, defMonths: 72 },
  { id: 'escobillas', name: 'Escobillas Limpiaparabrisas', emoji: '🧹', defKm: 0, defMonths: 12 },
]

export const FUEL_TYPES = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP']
export const TRANS_TYPES = ['Manual', 'Automático']

export function getMaintStatus(maint, currentKm) {
  if (!maint) return null
  const kmLeft = maint.next_km - currentKm
  const today = new Date()
  const nextDate = new Date(maint.next_date)
  const daysLeft = Math.floor((nextDate - today) / 86400000)
  if (kmLeft <= 0 || daysLeft <= 0) return 'overdue'
  if (kmLeft <= 2000 || daysLeft <= 30) return 'warn'
  return 'ok'
}

// ─── Date formatting (DD/MM/YYYY) ───

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
