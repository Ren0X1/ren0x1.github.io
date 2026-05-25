import { useState, useEffect, useRef } from 'react'
import { Bell, X, AlertTriangle, Clock, ShieldAlert, ChevronRight } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { getCars, getMaintenanceRecords, getItvRecords } from '../lib/supabase.js'
import { MAINT_TYPES, getMaintStatus, formatDate } from '../lib/constants.js'

export default function NotificationCenter({ userId, isMobile, dataVersion }) {
  const [alerts, setAlerts] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 60000)
    return () => clearInterval(interval)
  }, [userId, dataVersion])

  // Close on click outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const loadAlerts = async () => {
    try {
      const cars = await getCars(userId)
      const allAlerts = []

      for (const car of cars) {
        const [maint, itv] = await Promise.all([
          getMaintenanceRecords(car.id),
          getItvRecords(car.id),
        ])

        const vEmoji = car.vehicle_type === 'moto' ? '🏍️' : '🚗'
        const vName = `${car.brand} ${car.model}`

        // Maintenance alerts
        maint.forEach(m => {
          const status = getMaintStatus(m, car.current_km)
          if (status === 'overdue' || status === 'warn') {
            const mt = MAINT_TYPES.find(t => t.id === m.type_id)
            const kmLeft = m.next_km - car.current_km
            const daysLeft = m.next_date ? Math.floor((new Date(m.next_date) - new Date()) / 86400000) : null

            allAlerts.push({
              id: `maint-${m.id}`,
              type: status === 'overdue' ? 'danger' : 'warning',
              icon: mt?.emoji || '🔧',
              title: mt?.name || m.type_id,
              vehicle: `${vEmoji} ${vName}`,
              detail: status === 'overdue'
                ? `Vencido${kmLeft < 0 ? ` · ${Math.abs(kmLeft).toLocaleString()} km pasados` : ''}${daysLeft != null && daysLeft < 0 ? ` · hace ${Math.abs(daysLeft)} días` : ''}`
                : `Próximo${kmLeft > 0 ? ` · en ${kmLeft.toLocaleString()} km` : ''}${daysLeft != null && daysLeft > 0 ? ` · en ${daysLeft} días` : ''}`,
              priority: status === 'overdue' ? 0 : 1,
            })
          }
        })

        // ITV alerts
        const latestItv = itv[0]
        if (latestItv) {
          if (latestItv.result === 'negativa') {
            allAlerts.push({
              id: `itv-neg-${car.id}`, type: 'danger', icon: '🛡️',
              title: 'ITV Negativa', vehicle: `${vEmoji} ${vName}`,
              detail: `No apta — ${latestItv.defects || 'revisar defectos'}`,
              priority: 0,
            })
          } else if (latestItv.result === 'desfavorable' && !latestItv.resolved) {
            allAlerts.push({
              id: `itv-desf-${car.id}`, type: 'warning', icon: '🛡️',
              title: 'ITV Desfavorable', vehicle: `${vEmoji} ${vName}`,
              detail: `Pendiente reparar — ${latestItv.defects || 'revisar defectos'}`,
              priority: 0,
            })
          } else if (latestItv.expiry_date) {
            const dLeft = Math.floor((new Date(latestItv.expiry_date) - new Date()) / 86400000)
            if (dLeft < 0) {
              allAlerts.push({
                id: `itv-exp-${car.id}`, type: 'danger', icon: '🛡️',
                title: 'ITV Caducada', vehicle: `${vEmoji} ${vName}`,
                detail: `Caducada hace ${Math.abs(dLeft)} días`,
                priority: 0,
              })
            } else if (dLeft <= 60) {
              allAlerts.push({
                id: `itv-soon-${car.id}`, type: dLeft <= 30 ? 'warning' : 'info', icon: '🛡️',
                title: 'ITV próxima', vehicle: `${vEmoji} ${vName}`,
                detail: `Caduca en ${dLeft} días (${formatDate(latestItv.expiry_date)})`,
                priority: dLeft <= 30 ? 0 : 1,
              })
            }
          }
        }
      }

      // Sort: danger first, then warning, then info
      allAlerts.sort((a, b) => a.priority - b.priority)
      setAlerts(allAlerts)
    } catch (err) {
      console.error('Error loading alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const dangerCount = alerts.filter(a => a.type === 'danger').length
  const totalCount = alerts.length

  const badgeColor = dangerCount > 0 ? theme.red : totalCount > 0 ? theme.yellow : theme.green

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: 'none', color: theme.muted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', position: 'relative', padding: 4,
      }}>
        <Bell size={20} color={totalCount > 0 ? theme.accent : theme.muted} />
        {totalCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -4,
            background: badgeColor, color: '#000',
            borderRadius: 10, minWidth: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, padding: '0 4px',
          }}>
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: isMobile ? 'calc(100vw - 32px)' : 380,
          maxHeight: '70vh', overflowY: 'auto',
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 200,
          ...(isMobile ? { right: -60 } : {}),
        }}>
          <div style={{ ...css.flexBetween, padding: '14px 16px', borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: theme.white }}>
              Notificaciones {totalCount > 0 && <span style={{ color: theme.muted, fontWeight: 400 }}>({totalCount})</span>}
            </span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 30, textAlign: 'center', color: theme.muted, fontSize: 13 }}>Cargando...</div>
          ) : totalCount === 0 ? (
            <div style={{ padding: 30, textAlign: 'center' }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <p style={{ color: theme.muted, fontSize: 13, marginTop: 8 }}>Todo al día</p>
            </div>
          ) : (
            <div>
              {alerts.map(a => (
                <div key={a.id} style={{
                  padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  background: a.type === 'danger' ? `${theme.red}08` : 'transparent',
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{a.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: theme.white }}>{a.title}</span>
                      <span style={css.badge(
                        a.type === 'danger' ? theme.redSoft : a.type === 'warning' ? theme.yellowSoft : theme.accentSoft,
                        a.type === 'danger' ? theme.red : a.type === 'warning' ? theme.yellow : theme.accent
                      )}>
                        {a.type === 'danger' ? 'Urgente' : a.type === 'warning' ? 'Atención' : 'Info'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{a.vehicle}</div>
                    <div style={{ fontSize: 12, color: a.type === 'danger' ? theme.red : theme.muted, marginTop: 1 }}>{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
