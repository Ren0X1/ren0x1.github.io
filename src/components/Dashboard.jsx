import { useState, useEffect } from 'react'
import {
  Car, Plus, Trash2, AlertTriangle, CheckCircle, Clock,
  Gauge, Calendar, Settings, Fuel, Save
} from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { getCars, createCar, deleteCar, getMaintenanceRecords } from '../lib/supabase.js'
import { FUEL_TYPES, TRANS_TYPES, getMaintStatus } from '../lib/constants.js'
import { Modal, Field, Loader } from './ui.jsx'
import CarDetail from './CarDetail.jsx'

function CarFormModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    plate: '', brand: '', model: '', year: new Date().getFullYear(),
    transmission: 'Manual', fuel: 'Gasolina', current_km: 0, notes: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.plate || !form.brand || !form.model) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Coche">
      <div style={css.grid2}>
        <Field label="Matrícula"><input style={css.input} value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="1234 ABC" /></Field>
        <Field label="Marca"><input style={css.input} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="BMW" /></Field>
        <Field label="Modelo"><input style={css.input} value={form.model} onChange={e => set('model', e.target.value)} placeholder="320d" /></Field>
        <Field label="Año"><input style={css.input} type="number" value={form.year} onChange={e => set('year', +e.target.value)} /></Field>
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
        <Field label="Km actuales"><input style={css.input} type="number" value={form.current_km} onChange={e => set('current_km', +e.target.value)} /></Field>
      </div>
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
  const [cars, setCars] = useState([])
  const [carMaintMap, setCarMaintMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewCar, setShowNewCar] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState(null)

  const loadCars = async () => {
    try {
      const data = await getCars(user.id)
      setCars(data)
      // Load maintenance status for each car
      const maintMap = {}
      for (const car of data) {
        maintMap[car.id] = await getMaintenanceRecords(car.id)
      }
      setCarMaintMap(maintMap)
    } catch (err) {
      onToast('Error cargando coches: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCars() }, [])

  const handleAddCar = async (form) => {
    try {
      await createCar({ ...form, user_id: user.id })
      setShowNewCar(false)
      onToast('Coche añadido correctamente')
      loadCars()
    } catch (err) {
      onToast('Error al añadir: ' + err.message, 'error')
    }
  }

  const handleDeleteCar = async (id) => {
    if (!confirm('¿Eliminar este coche y todos sus datos?')) return
    try {
      await deleteCar(id)
      onToast('Coche eliminado')
      loadCars()
    } catch (err) {
      onToast('Error al eliminar: ' + err.message, 'error')
    }
  }

  // If a car is selected, show detail
  if (selectedCarId) {
    const car = cars.find(c => c.id === selectedCarId)
    if (!car) { setSelectedCarId(null); return null }
    return (
      <div style={css.container}>
        <CarDetail
          car={car}
          onBack={() => { setSelectedCarId(null); loadCars() }}
          onCarUpdated={loadCars}
          onToast={onToast}
        />
      </div>
    )
  }

  if (loading) return <Loader text="Cargando coches..." />

  return (
    <div style={css.container}>
      <div style={{ paddingTop: 28, paddingBottom: 40 }}>
        <div style={{ ...css.flexBetween, marginBottom: 24 }}>
          <div>
            <h1 style={css.h1}>Mis Coches</h1>
            <p style={css.subtitle}>{cars.length} vehículo{cars.length !== 1 ? 's' : ''} registrado{cars.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNewCar(true)} style={css.btn()}>
            <Plus size={16} /> Añadir Coche
          </button>
        </div>

        {cars.length === 0 ? (
          <div style={{ ...css.card, padding: 48, textAlign: 'center' }}>
            <Car size={48} color={theme.mutedLight} style={{ marginBottom: 12 }} />
            <p style={{ color: theme.muted }}>Aún no tienes coches registrados</p>
            <button onClick={() => setShowNewCar(true)} style={{ ...css.btn(), marginTop: 12 }}>
              <Plus size={14} /> Añadir tu primer coche
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {cars.map(car => {
              const maint = carMaintMap[car.id] || []
              let overdue = 0, warn = 0
              maint.forEach(m => {
                const s = getMaintStatus(m, car.current_km)
                if (s === 'overdue') overdue++
                if (s === 'warn') warn++
              })
              return (
                <div
                  key={car.id}
                  onClick={() => setSelectedCarId(car.id)}
                  style={{ ...css.card, padding: 0, cursor: 'pointer', transition: 'all .15s', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.cardHover }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.card }}
                >
                  <div style={{ padding: 20 }}>
                    <div style={css.flexBetween}>
                      <div>
                        <div style={{ ...css.flex, gap: 10, marginBottom: 4 }}>
                          <h3 style={{ ...css.h2, fontSize: 18 }}>{car.brand} {car.model}</h3>
                          <span style={css.badge(theme.accentSoft, theme.accent)}>{car.plate}</span>
                        </div>
                        <div style={{ ...css.flex, gap: 16, marginTop: 8 }}>
                          <span style={{ ...css.flex, gap: 4, color: theme.muted, fontSize: 13 }}><Gauge size={14} /> {car.current_km.toLocaleString()} km</span>
                          <span style={{ ...css.flex, gap: 4, color: theme.muted, fontSize: 13 }}><Calendar size={14} /> {car.year}</span>
                          <span style={{ ...css.flex, gap: 4, color: theme.muted, fontSize: 13 }}><Settings size={14} /> {car.transmission}</span>
                          <span style={{ ...css.flex, gap: 4, color: theme.muted, fontSize: 13 }}><Fuel size={14} /> {car.fuel}</span>
                        </div>
                      </div>
                      <div style={{ ...css.flex, gap: 8 }}>
                        {overdue > 0 && <span style={css.badge(theme.redSoft, theme.red)}><AlertTriangle size={11} /> {overdue}</span>}
                        {warn > 0 && <span style={css.badge(theme.yellowSoft, theme.yellow)}><Clock size={11} /> {warn}</span>}
                        {overdue === 0 && warn === 0 && maint.length > 0 && (
                          <span style={css.badge(theme.greenSoft, theme.green)}><CheckCircle size={11} /> Todo OK</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteCar(car.id) }}
                          style={css.btnSm(theme.redSoft, theme.red)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {maint.length > 0 && (
                    <div style={{ height: 3, background: theme.border, display: 'flex' }}>
                      {(() => {
                        const total = maint.length
                        const okC = maint.filter(m => getMaintStatus(m, car.current_km) === 'ok').length
                        const warnC = maint.filter(m => getMaintStatus(m, car.current_km) === 'warn').length
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
