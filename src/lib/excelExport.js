import * as XLSX from 'xlsx'
import { MAINT_TYPES, getMaintStatus, formatDate, getMaintenanceForVehicle } from './constants.js'

function calcAvgConsumption(fuelLogs) {
  if (fuelLogs.length < 2) return null
  const sorted = [...fuelLogs].sort((a, b) => a.km - b.km)
  const consumptions = []
  for (let i = 1; i < sorted.length; i++) {
    const kmDiff = sorted[i].km - sorted[i - 1].km
    if (kmDiff > 0) consumptions.push((sorted[i].liters / kmDiff) * 100)
  }
  return consumptions.length > 0 ? +(consumptions.reduce((s, v) => s + v, 0) / consumptions.length).toFixed(2) : null
}

// Helper: convert array of arrays to worksheet with column widths
function toSheet(data, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet(data)
  if (colWidths) ws['!cols'] = colWidths.map(w => ({ wch: w }))
  return ws
}

// Helper: apply cell styles via simple bold/color (limited support in free SheetJS)
function styleHeaderRow(ws, rowIdx, numCols) {
  for (let c = 0; c < numCols; c++) {
    const ref = XLSX.utils.encode_cell({ r: rowIdx, c })
    if (ws[ref]) {
      ws[ref].s = ws[ref].s || {}
    }
  }
}

export function exportCarExcel({ car, maintenance, kmLogs, fuelLogs, parts, itvRecords = [], todos = [] }) {
  const wb = XLSX.utils.book_new()
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  // ═══════════════════════════════════════════════
  // SHEET 1: RESUMEN
  // ═══════════════════════════════════════════════
  const totalMaintCost = maintenance.reduce((s, m) => s + +(m.cost || 0), 0)
  const totalFuelCost = fuelLogs.reduce((s, f) => s + +(f.total_cost || 0), 0)
  const grandTotal = totalMaintCost + totalFuelCost
  const totalLiters = fuelLogs.reduce((s, f) => s + +(f.liters || 0), 0)
  const avgConsumption = calcAvgConsumption(fuelLogs)
  const avgPrice = fuelLogs.length > 0 ? (fuelLogs.reduce((s, f) => s + +(f.price_liter || 0), 0) / fuelLogs.length).toFixed(3) : 0
  const costPerKm = car.current_km > 0 ? (grandTotal / car.current_km).toFixed(3) : 0

  let okCount = 0, warnCount = 0, overdueCount = 0
  maintenance.forEach(m => {
    const s = getMaintStatus(m, car.current_km)
    if (s === 'ok') okCount++
    else if (s === 'warn') warnCount++
    else if (s === 'overdue') overdueCount++
  })

  const latestItv = itvRecords[0]
  let itvLabel = 'Sin registros'
  if (latestItv) {
    if (latestItv.result === 'negativa') itvLabel = 'NEGATIVA - No apta'
    else if (latestItv.result === 'desfavorable' && !latestItv.resolved) itvLabel = 'DESFAVORABLE - Pendiente'
    else if (latestItv.expiry_date) {
      const days = Math.floor((new Date(latestItv.expiry_date) - new Date()) / 86400000)
      if (days < 0) itvLabel = `CADUCADA hace ${Math.abs(days)} días`
      else if (days <= 30) itvLabel = `Caduca en ${days} días`
      else itvLabel = `Válida hasta ${formatDate(latestItv.expiry_date)}`
    } else itvLabel = 'Favorable'
  }

  const resumen = [
    ['INFORME DE VEHÍCULO'],
    [],
    ['Vehículo', `${car.brand} ${car.model}`],
    ['Matrícula', car.plate],
    ['Tipo', car.vehicle_type === 'moto' ? 'Moto' : 'Coche'],
    ['Año', car.year],
    ['Combustible', car.fuel],
    ['Transmisión', car.transmission],
    ['Kilómetros actuales', (car.current_km || 0)],
    ['Notas', car.notes || ''],
    [],
    ['Generado el', today],
    [],
    ['RESUMEN ECONÓMICO'],
    [],
    ['Concepto', 'Importe (€)'],
    ['Mantenimiento', +totalMaintCost.toFixed(2)],
    ['Combustible', +totalFuelCost.toFixed(2)],
    ['TOTAL GASTADO', +grandTotal.toFixed(2)],
    [],
    ['Coste por km', +costPerKm],
    [],
    ['ESTADÍSTICAS DE COMBUSTIBLE'],
    [],
    ['Repostajes totales', fuelLogs.length],
    ['Litros totales', +totalLiters.toFixed(2)],
    ['Precio medio €/L', +avgPrice],
    ['Consumo medio L/100km', avgConsumption || 'Sin datos'],
    [],
    ['ESTADO DE MANTENIMIENTOS'],
    [],
    ['Estado', 'Cantidad'],
    ['Al día', okCount],
    ['Próximos', warnCount],
    ['Vencidos', overdueCount],
    ['Total registros', maintenance.length],
    [],
    ['INSPECCIÓN TÉCNICA (ITV)'],
    [],
    ['Estado actual', itvLabel],
    ['Registros totales', itvRecords.length],
    [],
    ['TAREAS PENDIENTES'],
    [],
    ['Pendientes', todos.filter(t => !t.completed).length],
    ['Completadas', todos.filter(t => t.completed).length],
  ]

  const wsResumen = toSheet(resumen, [25, 30])
  // Merge title cells
  wsResumen['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } },
    { s: { r: 22, c: 0 }, e: { r: 22, c: 1 } },
    { s: { r: 29, c: 0 }, e: { r: 29, c: 1 } },
    { s: { r: 37, c: 0 }, e: { r: 37, c: 1 } },
    { s: { r: 42, c: 0 }, e: { r: 42, c: 1 } },
  ]
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

  // ═══════════════════════════════════════════════
  // SHEET 2: MANTENIMIENTOS
  // ═══════════════════════════════════════════════
  const maintHeaders = ['Elemento', 'Estado', 'Último km', 'Fecha último', 'Próximo km', 'Fecha próximo', 'Coste (€)', 'Notas']
  const maintData = [
    ['MANTENIMIENTOS'],
    [],
    maintHeaders,
    ...getMaintenanceForVehicle(car.vehicle_type, car.fuel).map(mt => {
      const m = maintenance.find(x => x.type_id === mt.id)
      const status = m ? getMaintStatus(m, car.current_km) : null
      return [
        mt.name,
        !m ? 'Sin datos' : status === 'ok' ? 'AL DÍA' : status === 'warn' ? 'PRÓXIMO' : 'VENCIDO',
        m ? (m.last_km || 0) : '',
        m && m.last_date ? formatDate(m.last_date) : '',
        m ? (m.next_km || 0) : '',
        m && m.next_date ? formatDate(m.next_date) : '',
        m && m.cost ? +(+m.cost).toFixed(2) : '',
        m?.notes || '',
      ]
    }),
    [],
    ['TOTAL', '', '', '', '', '', +totalMaintCost.toFixed(2), ''],
  ]
  const wsMaint = toSheet(maintData, [32, 14, 14, 14, 14, 14, 12, 30])
  wsMaint['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
  XLSX.utils.book_append_sheet(wb, wsMaint, 'Mantenimientos')

  // ═══════════════════════════════════════════════
  // SHEET 3: REPOSTAJES
  // ═══════════════════════════════════════════════
  if (fuelLogs.length > 0) {
    const sortedFuel = [...fuelLogs].sort((a, b) => new Date(b.date) - new Date(a.date))
    const fuelData = [
      ['REPOSTAJES'],
      [],
      ['Fecha', 'Kilómetros', 'Litros', 'Precio €/L', 'Total €', 'Depósito lleno', 'Modo conducción', 'Notas'],
      ...sortedFuel.map(l => [
        formatDate(l.date), (l.km || 0), +(+l.liters).toFixed(2),
        +(+l.price_liter).toFixed(3), +(+l.total_cost).toFixed(2),
        l.full_tank ? 'Sí' : 'No', l.driving_mode || 'ciudad', l.notes || '',
      ]),
      [],
      ['TOTAL', '', +totalLiters.toFixed(2), +avgPrice, +totalFuelCost.toFixed(2), '', '', ''],
      [],
      ['Consumo medio (L/100km)', avgConsumption || 'Sin datos'],
    ]
    const wsFuel = toSheet(fuelData, [14, 14, 12, 12, 14, 14, 16, 30])
    wsFuel['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    XLSX.utils.book_append_sheet(wb, wsFuel, 'Repostajes')
  }

  // ═══════════════════════════════════════════════
  // SHEET 4: ITV
  // ═══════════════════════════════════════════════
  if (itvRecords.length > 0) {
    const itvData = [
      ['HISTORIAL ITV'],
      [],
      ['Fecha inspección', 'Fecha caducidad', 'Resultado', 'Estación', 'Defectos', 'Reparado', 'Coste €', 'Notas'],
      ...itvRecords.map(r => [
        formatDate(r.inspection_date), r.expiry_date ? formatDate(r.expiry_date) : '',
        (r.result || '').toUpperCase(), r.station || '',
        r.defects || '', r.resolved ? 'Sí' : (r.result === 'desfavorable' ? 'No' : ''),
        r.cost ? +(+r.cost).toFixed(2) : '', r.notes || '',
      ]),
    ]
    const wsItv = toSheet(itvData, [16, 16, 16, 20, 30, 10, 12, 30])
    wsItv['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    XLSX.utils.book_append_sheet(wb, wsItv, 'ITV')
  }

  // ═══════════════════════════════════════════════
  // SHEET 5: RECAMBIOS
  // ═══════════════════════════════════════════════
  if (parts.length > 0) {
    const partsData = [
      ['RECAMBIOS'],
      [],
      ['Nombre', 'Referencia', 'Enlace'],
      ...parts.map(p => [p.name, p.reference || '', p.url || '']),
    ]
    const wsParts = toSheet(partsData, [30, 25, 50])
    wsParts['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
    XLSX.utils.book_append_sheet(wb, wsParts, 'Recambios')
  }

  // ═══════════════════════════════════════════════
  // SHEET 6: KILÓMETROS
  // ═══════════════════════════════════════════════
  if (kmLogs.length > 0) {
    const kmData = [
      ['HISTORIAL DE KILÓMETROS'],
      [],
      ['Fecha', 'Kilómetros', 'Notas'],
      ...kmLogs.map(l => [formatDate(l.date), (l.km || 0), l.notes || '']),
    ]
    const wsKm = toSheet(kmData, [14, 14, 40])
    wsKm['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
    XLSX.utils.book_append_sheet(wb, wsKm, 'Kilómetros')
  }

  // ═══════════════════════════════════════════════
  // SHEET 7: TAREAS
  // ═══════════════════════════════════════════════
  if (todos.length > 0) {
    const todosData = [
      ['TAREAS'],
      [],
      ['Estado', 'Prioridad', 'Título', 'Notas', 'Fecha creación', 'Fecha completado'],
      ...todos.map(t => [
        t.completed ? 'Completada' : 'Pendiente',
        (t.priority || 'media').toUpperCase(),
        t.title, t.notes || '',
        t.created_at ? formatDate(t.created_at.split('T')[0]) : '',
        t.completed_at ? formatDate(t.completed_at.split('T')[0]) : '',
      ]),
    ]
    const wsTodos = toSheet(todosData, [12, 10, 30, 30, 14, 14])
    wsTodos['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]
    XLSX.utils.book_append_sheet(wb, wsTodos, 'Tareas')
  }

  // Save
  XLSX.writeFile(wb, `${car.brand}_${car.model}_${car.plate.replace(/\s/g, '')}_${new Date().toISOString().split('T')[0]}.xlsx`)
}
