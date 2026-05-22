import { useState } from 'react'
import { Fuel, Plus, Trash2, Save, TrendingDown } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { createFuelLog, deleteFuelLog } from '../lib/supabase.js'
import { Modal, Field, Stat, ResponsiveGrid2 } from './ui.jsx'

const today = new Date().toISOString().split('T')[0]

function FuelFormModal({ open, onClose, onSave, carKm }) {
  const [form, setForm] = useState({ km: carKm || 0, date: today, liters: 0, price_liter: 0, full_tank: true, notes: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const total = (form.liters * form.price_liter).toFixed(2)
  const handleSave = async () => {
    if (!form.liters) return
    setSaving(true)
    try { await onSave({ ...form, total_cost: +total }) } finally { setSaving(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Nuevo Repostaje">
      <ResponsiveGrid2>
        <Field label="Kilómetros"><input style={css.input} type="number" value={form.km} onChange={e => set('km', +e.target.value)} /></Field>
        <Field label="Fecha"><input style={css.input} type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Litros"><input style={css.input} type="number" step="0.01" value={form.liters} onChange={e => set('liters', +e.target.value)} /></Field>
        <Field label="Precio/litro (€)"><input style={css.input} type="number" step="0.001" value={form.price_liter} onChange={e => set('price_liter', +e.target.value)} /></Field>
      </ResponsiveGrid2>
      <div style={{ ...css.card, padding: 12, marginBottom: 14, background: theme.bg }}>
        <span style={{ fontSize: 12, color: theme.muted }}>Total: </span>
        <span style={{ fontSize: 18, fontWeight: 800, color: theme.accent }}>{total} €</span>
      </div>
      <Field label="Depósito lleno">
        <div style={{ display: 'flex', gap: 8 }}>
          {[true, false].map(v => (
            <button key={String(v)} onClick={() => set('full_tank', v)} style={{
              ...css.btn(form.full_tank === v ? theme.accent : theme.bg, form.full_tank === v ? '#000' : theme.muted),
              flex: 1, justifyContent: 'center', border: `1px solid ${theme.border}`,
            }}>{v ? 'Sí (lleno)' : 'No (parcial)'}</button>
          ))}
        </div>
      </Field>
      <Field label="Notas"><input style={css.input} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Gasolinera, tipo..." /></Field>
      <div style={{ ...css.flex, justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
        <button onClick={onClose} style={css.btnOutline}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={css.btn()}><Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </Modal>
  )
}

export default function FuelTab({ carId, carKm, fuelLogs, onReload, onToast, isMobile }) {
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = async (form) => {
    try {
      await createFuelLog({ car_id: carId, km: form.km, date: form.date, liters: form.liters, price_liter: form.price_liter, total_cost: form.total_cost, full_tank: form.full_tank, notes: form.notes })
      setShowAdd(false); onToast('Repostaje registrado'); onReload()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  const handleDelete = async (id) => {
    try { await deleteFuelLog(id); onToast('Repostaje eliminado'); onReload() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  // Calculate average consumption (L/100km) from consecutive full-tank logs
  const sorted = [...fuelLogs].sort((a, b) => a.km - b.km)
  let totalL = 0, totalKm = 0
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].full_tank && sorted[i - 1].full_tank) {
      totalL += sorted[i].liters
      totalKm += sorted[i].km - sorted[i - 1].km
    }
  }
  const avgConsumption = totalKm > 0 ? ((totalL / totalKm) * 100).toFixed(1) : null
  const totalSpent = fuelLogs.reduce((s, l) => s + (l.total_cost || 0), 0)
  const avgPrice = fuelLogs.length > 0 ? (fuelLogs.reduce((s, l) => s + (l.price_liter || 0), 0) / fuelLogs.length).toFixed(3) : null

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 8 : 12, marginBottom: 16 }}>
        {avgConsumption && <Stat icon={<TrendingDown size={18} color="#3b82f6" />} label="Consumo medio" value={`${avgConsumption} L/100`} color="#3b82f6" />}
        <Stat icon={<Fuel size={18} color={theme.accent} />} label="Total gasolina" value={`${totalSpent.toFixed(0)}€`} />
        {avgPrice && <Stat icon={<Fuel size={18} color={theme.green} />} label="Precio medio/L" value={`${avgPrice}€`} color={theme.green} />}
      </div>

      <div style={{ ...css.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ ...css.flexBetween, padding: isMobile ? '12px 14px' : '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={css.h3}><Fuel size={16} style={{ marginRight: 6 }} />Repostajes</h3>
          <button onClick={() => setShowAdd(true)} style={css.btnSm(theme.accent, '#000')}><Plus size={12} /> Añadir</button>
        </div>
        {fuelLogs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Fuel size={32} color={theme.mutedLight} style={{ marginBottom: 8 }} />
            <p style={{ color: theme.muted, fontSize: 13 }}>Sin repostajes</p>
            <button onClick={() => setShowAdd(true)} style={{ ...css.btn(), marginTop: 12 }}><Plus size={14} /> Registrar repostaje</button>
          </div>
        ) : isMobile ? (
          <div style={{ padding: 10 }}>
            {fuelLogs.map(l => (
              <div key={l.id} style={{ padding: '10px 4px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <span style={{ fontWeight: 700 }}>{l.liters}L</span>
                    <span style={{ color: theme.accent, fontWeight: 600 }}>{l.total_cost?.toFixed(2)}€</span>
                    <span style={{ color: theme.muted, fontSize: 11 }}>{l.date}</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
                    {l.km?.toLocaleString()} km · {l.price_liter}€/L{l.full_tank ? ' · Lleno' : ''}{l.notes ? ` · ${l.notes}` : ''}
                  </div>
                </div>
                <button onClick={() => handleDelete(l.id)} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  {['Fecha', 'Km', 'Litros', '€/L', 'Total', 'Lleno', 'Notas', ''].map((h, i) => <th key={i} style={css.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map(l => (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={css.td}>{l.date}</td>
                    <td style={{ ...css.td, color: theme.muted }}>{l.km?.toLocaleString()}</td>
                    <td style={{ ...css.td, fontWeight: 600 }}>{l.liters} L</td>
                    <td style={{ ...css.td, color: theme.muted }}>{l.price_liter}€</td>
                    <td style={{ ...css.td, fontWeight: 700, color: theme.accent }}>{l.total_cost?.toFixed(2)}€</td>
                    <td style={css.td}>{l.full_tank ? '✅' : '—'}</td>
                    <td style={{ ...css.td, color: theme.muted }}>{l.notes || '—'}</td>
                    <td style={css.td}><button onClick={() => handleDelete(l.id)} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <FuelFormModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} carKm={carKm} />
    </>
  )
}
