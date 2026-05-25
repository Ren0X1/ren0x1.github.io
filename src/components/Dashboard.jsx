import { useState, useEffect } from 'react'
import {
  Car, Plus, Trash2, AlertTriangle, CheckCircle, Clock,
  Gauge, Calendar, Settings, Fuel, Save, Package
} from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { useIsMobile } from '../lib/useIsMobile.js'
import { getCars, createCar, deleteCar, getMaintenanceRecords, getCarParts, getItvRecords } from '../lib/supabase.js'
import { FUEL_TYPES, TRANS_TYPES, VEHICLE_TYPES, getMaintStatus, formatDate } from '../lib/constants.js'
import { Modal, Field, Loader, ResponsiveGrid2, NumInput } from './ui.jsx'
import CarDetail from './CarDetail.jsx'

function CarFormModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    plate: '', brand: '', model: '', year: new Date().getFullYear(),
    transmission: 'Manual', fuel: 'Gasolina', current_km: 0, notes: '',
    vehicle_type: 'coche',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = async () => {
    if (!form.plate || !form.brand || !form.model) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Nuevo Vehículo">
      <Field label="Tipo de vehículo">
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          {VEHICLE_TYPES.map(v => (
            <button key={v.value} onClick={() => set('vehicle_type', v.value)} type="button" style={{
              ...css.btn(form.vehicle_type === v.value ? theme.accent : theme.bg, form.vehicle_type === v.value ? '#000' : theme.muted),
              flex: 1, justifyContent: 'center', border: `1px solid ${form.vehicle_type === v.value ? theme.accent : theme.border}`,
              fontSize: 14, padding: '10px 8px',
            }}>{v.emoji} {v.label}</button>
          ))}
        </div>
      </Field>
      <ResponsiveGrid2>
        <Field label="Matrícula"><input style={css.input} value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="1234 ABC" /></Field>
        <Field label="Marca"><input style={css.input} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="BMW" /></Field>
        <Field label="Modelo"><input style={css.input} value={form.model} onChange={e => set('model', e.target.value)} placeholder="320d" /></Field>
        <Field label="Año"><NumInput value={form.year} onChange={e => set('year', +e.target.value)} /></Field>
        <Field label="Transmisión">
          <select style={css.select} value={form.transmission} onChange={e => set('transmission', e.target.value)}>
            {TRANS_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Combustible">
          <select style={css.select} value={form.fuel} onChange={e => set('fuel', e.target.value)}>
            {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Km actuales"><NumInput value={form.current_km} onChange={e => set('current_km', +e.target.value)} /></Field>
      </ResponsiveGrid2>
      <Field label="Notas"><input style={css.input} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Opcional" /></Field>
      <div style={{ ...css.flex, justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
        <button onClick={onClose} style={css.btnOutline}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={css.btn()}>
          <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  )
}

export default function Dashboard({ user, onToast }) {
  const mob = useIsMobile()
  const [cars, setCars] = useState([])
  const [carMeta, setCarMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewCar, setShowNewCar] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState(null)

  const loadCars = async () => {
    try {
      const data = await getCars(user.id)
      setCars(data)
      const meta = {}
      for (const car of data) {
        const [maint, parts, itv] = await Promise.all([getMaintenanceRecords(car.id), getCarParts(car.id), getItvRecords(car.id)])
        meta[car.id] = { maint, partsCount: parts.length, itv: itv[0] || null }
      }
      setCarMeta(meta)
    } catch (err) { onToast('Error cargando vehículos: ' + err.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadCars() }, [])

  const handleAddCar = async (form) => {
    try {
      await createCar({ ...form, user_id: user.id })
      setShowNewCar(false); onToast('Vehículo añadido'); loadCars()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  const handleDeleteCar = async (id) => {
    if (!confirm('¿Eliminar este vehículo y todos sus datos?')) return
    try { await deleteCar(id); onToast('Vehículo eliminado'); loadCars() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  if (selectedCarId) {
    const car = cars.find(c => c.id === selectedCarId)
    if (!car) { setSelectedCarId(null); return null }
    return (
      <div style={css.container}>
        <CarDetail car={car} onBack={() => { setSelectedCarId(null); loadCars() }} onCarUpdated={loadCars} onToast={onToast} />
      </div>
    )
  }

  if (loading) return <Loader text="Cargando vehículos..." />

  return (
    <div style={css.container}>
      <div style={{ paddingTop: mob ? 20 : 28, paddingBottom: 40 }}>
        <div style={{ ...css.flexBetween, marginBottom: 20, gap: 12 }}>
          <div>
            <h1 style={{ ...css.h1, fontSize: mob ? 22 : 26 }}>Mis Vehículos</h1>
            <p style={css.subtitle}>{cars.length} vehículo{cars.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNewCar(true)} style={css.btn()}>
            <Plus size={16} /> {mob ? 'Añadir' : 'Añadir'}
          </button>
        </div>

        {cars.length === 0 ? (
          <div style={{ ...css.card, padding: 40, textAlign: 'center' }}>
            <Car size={40} color={theme.mutedLight} style={{ marginBottom: 12 }} />
            <p style={{ color: theme.muted, fontSize: 13 }}>Aún no tienes vehículos registrados</p>
            <button onClick={() => setShowNewCar(true)} style={{ ...css.btn(), marginTop: 12 }}><Plus size={14} /> Añadir tu primer vehículo</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {cars.map(car => {
              const mt = carMeta[car.id] || { maint: [], partsCount: 0, itv: null }
              let overdue = 0, warn = 0
              mt.maint.forEach(r => { const s = getMaintStatus(r, car.current_km); if (s === 'overdue') overdue++; if (s === 'warn') warn++ })
              let itvBadge = null
              if (mt.itv) {
                const dLeft = mt.itv.expiry_date ? Math.floor((new Date(mt.itv.expiry_date) - new Date()) / 86400000) : null
                if (mt.itv.result === 'negativa') itvBadge = { bg: theme.redSoft, color: theme.red, text: 'ITV ✗' }
                else if (dLeft !== null && dLeft < 0) itvBadge = { bg: theme.redSoft, color: theme.red, text: 'ITV caducada' }
                else if (dLeft !== null && dLeft <= 30) itvBadge = { bg: theme.yellowSoft, color: theme.yellow, text: `ITV ${dLeft}d` }
              }
              return (
                <div key={car.id} onClick={() => setSelectedCarId(car.id)}
                  style={{ ...css.card, padding: 0, cursor: 'pointer', transition: 'all .15s', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.cardHover }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.card }}>
                  <div style={{ padding: mob ? 14 : 20 }}>
                    {/* Title + plate */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ ...css.h2, fontSize: mob ? 16 : 18 }}>{car.vehicle_type === 'moto' ? '🏍️' : '🚗'} {car.brand} {car.model}</h3>
                      <span style={css.badge(theme.accentSoft, theme.accent)}>{car.plate}</span>
                      {/* Badges and delete on same row for mobile */}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                        {overdue > 0 && <span style={css.badge(theme.redSoft, theme.red)}><AlertTriangle size={11} /> {overdue}</span>}
                        {warn > 0 && <span style={css.badge(theme.yellowSoft, theme.yellow)}><Clock size={11} /> {warn}</span>}
                        {overdue === 0 && warn === 0 && mt.maint.length > 0 && <span style={css.badge(theme.greenSoft, theme.green)}><CheckCircle size={11} /> OK</span>}
                        {itvBadge && <span style={css.badge(itvBadge.bg, itvBadge.color)}>{itvBadge.text}</span>}
                        <button onClick={e => { e.stopPropagation(); handleDeleteCar(car.id) }} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {/* Info row */}
                    <div style={{ display: 'flex', gap: mob ? 10 : 16, marginTop: 8, flexWrap: 'wrap', fontSize: mob ? 12 : 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.muted }}><Gauge size={13} /> {car.current_km.toLocaleString()} km</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.muted }}><Calendar size={13} /> {car.year}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.muted }}><Settings size={13} /> {car.transmission}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.muted }}><Fuel size={13} /> {car.fuel}</span>
                      {mt.partsCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.muted }}><Package size={13} /> {mt.partsCount}</span>}
                    </div>
                  </div>
                  {mt.maint.length > 0 && (
                    <div style={{ height: 3, background: theme.border, display: 'flex' }}>
                      {(() => {
                        const total = mt.maint.length
                        const okC = mt.maint.filter(r => getMaintStatus(r, car.current_km) === 'ok').length
                        const warnC = mt.maint.filter(r => getMaintStatus(r, car.current_km) === 'warn').length
                        return (<>
                          <div style={{ width: `${(okC / total) * 100}%`, background: theme.green }} />
                          <div style={{ width: `${(warnC / total) * 100}%`, background: theme.yellow }} />
                          <div style={{ flex: 1, background: total - okC - warnC > 0 ? theme.red : 'transparent' }} />
                        </>)
                      })()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <CarFormModal open={showNewCar} onClose={() => setShowNewCar(false)} onSave={handleAddCar} />
    </div>
  )
}
