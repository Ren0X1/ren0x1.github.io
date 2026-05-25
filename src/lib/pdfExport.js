import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MAINT_TYPES, getMaintStatus, formatDate, getMaintenanceForVehicle } from '../lib/constants.js'

export function exportCarPdf({ car, maintenance, kmLogs, fuelLogs, parts }) {
  const doc = new jsPDF()
  const accent = [245, 158, 11]
  const gray = [150, 150, 150]
  let y = 20

  // Title
  doc.setFontSize(22)
  doc.setTextColor(...accent)
  doc.text('Pibes Mecánicos', 14, y)
  doc.setFontSize(10)
  doc.setTextColor(...gray)
  doc.text(`Informe generado: ${new Date().toLocaleDateString('es-ES')}`, 14, y + 8)
  y += 20

  // Car info
  doc.setFontSize(16)
  doc.setTextColor(40, 40, 40)
  doc.text(`${car.brand} ${car.model}`, 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setTextColor(...gray)
  doc.text(`Matrícula: ${car.plate}  |  Año: ${car.year}  |  ${car.transmission}  |  ${car.fuel}  |  ${car.current_km?.toLocaleString()} km`, 14, y)
  y += 12

  // Maintenance table
  doc.setFontSize(13)
  doc.setTextColor(40, 40, 40)
  doc.text('Mantenimientos', 14, y)
  y += 2

  const maintRows = getMaintenanceForVehicle(car.vehicle_type, car.fuel).map(mt => {
    const m = maintenance.find(x => x.type_id === mt.id)
    const status = m ? getMaintStatus(m, car.current_km) : null
    const statusText = status === 'ok' ? 'OK' : status === 'warn' ? 'Próximo' : status === 'overdue' ? 'VENCIDO' : 'Sin datos'
    return [
      mt.name,
      statusText,
      m ? m.last_km?.toLocaleString() + ' km' : '—',
      formatDate(m?.last_date),
      m ? m.next_km?.toLocaleString() + ' km' : '—',
      formatDate(m?.next_date),
      m?.cost ? m.cost + '€' : '—',
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Elemento', 'Estado', 'Último km', 'Fecha últ.', 'Próximo km', 'Fecha próx.', 'Coste']],
    body: maintRows,
    theme: 'grid',
    headStyles: { fillColor: accent, textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: [60, 60, 60] },
    columnStyles: {
      1: { cellWidth: 18 },
      6: { cellWidth: 16 },
    },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === 'body') {
        const val = data.cell.raw
        if (val === 'VENCIDO') data.cell.styles.textColor = [239, 68, 68]
        if (val === 'Próximo') data.cell.styles.textColor = [234, 179, 8]
        if (val === 'OK') data.cell.styles.textColor = [34, 197, 94]
      }
    },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 12

  // Parts table
  if (parts.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(13)
    doc.setTextColor(40, 40, 40)
    doc.text('Recambios', 14, y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [['Nombre', 'Referencia', 'Enlace']],
      body: parts.map(p => [p.name, p.reference || '—', p.url || '—']),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  // Fuel logs
  if (fuelLogs.length > 0) {
    if (y > 220) { doc.addPage(); y = 20 }
    doc.setFontSize(13)
    doc.setTextColor(40, 40, 40)
    doc.text('Repostajes', 14, y)
    y += 2

    const totalFuel = fuelLogs.reduce((s, l) => s + (l.total_cost || 0), 0)
    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Km', 'Litros', '€/L', 'Total', 'Lleno', 'Notas']],
      body: fuelLogs.map(l => [
        formatDate(l.date), l.km?.toLocaleString(), l.liters + 'L', l.price_liter + '€',
        (l.total_cost || 0).toFixed(2) + '€', l.full_tank ? 'Sí' : 'No', l.notes || '',
      ]),
      foot: [['', '', '', 'TOTAL:', totalFuel.toFixed(2) + '€', '', '']],
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7, textColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  // KM History
  if (kmLogs.length > 0) {
    if (y > 230) { doc.addPage(); y = 20 }
    doc.setFontSize(13)
    doc.setTextColor(40, 40, 40)
    doc.text('Historial de Kilómetros', 14, y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Kilómetros', 'Notas']],
      body: kmLogs.map(l => [formatDate(l.date), l.km?.toLocaleString() + ' km', l.notes || '—']),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...gray)
    doc.text(`Pibes Mecánicos — ${car.brand} ${car.model} (${car.plate})`, 14, 290)
    doc.text(`Página ${i}/${pages}`, 185, 290)
  }

  doc.save(`${car.brand}_${car.model}_${car.plate.replace(/\s/g, '')}.pdf`)
}
