export const VEHICLE_TYPES = [
  { value: 'coche', label: 'Coche', emoji: '🚗' },
  { value: 'moto', label: 'Moto', emoji: '🏍️' },
]

export const MAINT_TYPES = [
  // ── Ambos ──
  { id: 'aceite', name: 'Aceite Motor', emoji: '🛢️', defKm: 10000, defMonths: 12, for: ['coche', 'moto'] },
  { id: 'filtro_aceite', name: 'Filtro de Aceite', emoji: '🔧', defKm: 10000, defMonths: 12, for: ['coche', 'moto'] },
  { id: 'filtro_aire', name: 'Filtro de Aire', emoji: '💨', defKm: 20000, defMonths: 24, for: ['coche', 'moto'] },
  { id: 'pastillas_del', name: 'Pastillas Freno Del.', emoji: '🛑', defKm: 40000, defMonths: 48, for: ['coche', 'moto'] },
  { id: 'pastillas_tras', name: 'Pastillas Freno Tras.', emoji: '🛑', defKm: 50000, defMonths: 60, for: ['coche', 'moto'] },
  { id: 'discos_freno', name: 'Discos de Freno', emoji: '💿', defKm: 70000, defMonths: 72, for: ['coche', 'moto'] },
  { id: 'neumaticos', name: 'Neumáticos', emoji: '⭕', defKm: 45000, defMonths: 60, for: ['coche', 'moto'] },
  { id: 'liquido_frenos', name: 'Líquido de Frenos', emoji: '💧', defKm: 40000, defMonths: 24, for: ['coche', 'moto'] },
  { id: 'refrigerante', name: 'Refrigerante', emoji: '❄️', defKm: 50000, defMonths: 24, for: ['coche', 'moto'] },
  { id: 'bateria', name: 'Batería', emoji: '🔋', defKm: 60000, defMonths: 48, for: ['coche', 'moto'] },
  { id: 'embrague', name: 'Embrague', emoji: '🦶', defKm: 120000, defMonths: 0, for: ['coche', 'moto'] },
  { id: 'amortiguadores', name: 'Amortiguadores', emoji: '🔽', defKm: 80000, defMonths: 72, for: ['coche', 'moto'] },
  // ── Bujías: gasolina (coches+motos) — NO diésel ──
  { id: 'bujias', name: 'Bujías', emoji: '⚡', defKm: 40000, defMonths: 48, for: ['coche', 'moto'], excludeFuel: ['Diésel'] },
  // ── Calentadores: solo diésel (solo coches) ──
  { id: 'calentadores', name: 'Calentadores', emoji: '🔥', defKm: 100000, defMonths: 0, for: ['coche'], onlyFuel: ['Diésel'] },
  // ── Solo coches ──
  { id: 'filtro_habitaculo', name: 'Filtro Habitáculo', emoji: '🌬️', defKm: 15000, defMonths: 12, for: ['coche'] },
  { id: 'correa_dist', name: 'Correa Distribución', emoji: '⛓️', defKm: 120000, defMonths: 60, for: ['coche'] },
  { id: 'diferencial', name: 'Aceite Diferencial', emoji: '⚙️', defKm: 60000, defMonths: 60, for: ['coche'] },
  { id: 'caja_cambios', name: 'Aceite Caja Cambios', emoji: '🔄', defKm: 60000, defMonths: 60, for: ['coche'] },
  { id: 'escobillas', name: 'Escobillas Limpiaparabrisas', emoji: '🧹', defKm: 0, defMonths: 12, for: ['coche'] },
  // ── Solo motos ──
  { id: 'cadena', name: 'Cadena', emoji: '⛓️', defKm: 25000, defMonths: 36, for: ['moto'] },
  { id: 'kit_arrastre', name: 'Kit Arrastre (piñón+corona)', emoji: '🔗', defKm: 25000, defMonths: 36, for: ['moto'] },
  { id: 'liquido_embrague', name: 'Líquido Embrague', emoji: '💧', defKm: 40000, defMonths: 24, for: ['moto'] },
]

export function getMaintenanceForVehicle(vehicleType, fuelType) {
  return MAINT_TYPES.filter(m => {
    if (!m.for.includes(vehicleType || 'coche')) return false
    if (m.excludeFuel && m.excludeFuel.includes(fuelType)) return false
    if (m.onlyFuel && !m.onlyFuel.includes(fuelType)) return false
    return true
  })
}

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

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
