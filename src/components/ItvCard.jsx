import { useState } from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, Plus, Edit2, Trash2, Save, AlertTriangle, Calendar } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { createItvRecord, updateItvRecord, deleteItvRecord } from '../lib/supabase.js'
import { Modal, Field, ResponsiveGrid2 } from './ui.jsx'

const RESULTS = [
  { value: 'favorable', label: 'Favorable', color: theme.green, desc: 'Sin defectos' },
  { value: 'desfavorable', label: 'Desfavorable', color: theme.yellow, desc: 'Defectos leves — plazo para reparar' },
  { value: 'negativa', label: 'Negativa', color: theme.red, desc: 'Defectos graves — no puede circular' },
]

function getItvStatus(record) {
  if (!record) return { status: 'none', label: 'Sin ITV', color: theme.mutedLight }
  if (record.result === 'negativa') return { status: 'failed', label: 'No apta', color: theme.red }
  if (record.result === 'desfavorable' && !record.resolved) return { status: 'defects', label: 'Pendiente reparar', color: theme.yellow }

  const today = new Date()
  const expiry = new Date(record.expiry_date)
  const daysLeft = Math.floor((expiry - today) / 86400000)

  if (daysLeft < 0) return { status: 'expired', label: `Caducada hace ${Math.abs(daysLeft)} días`, color: theme.red }
  if (daysLeft <= 30) return { status: 'soon', label: `Caduca en ${daysLeft} días`, color: theme.yellow }
  if (daysLeft <= 60) return { status: 'approaching', label: `Caduca en ${daysLeft} días`, color: theme.accent }
  return { status: 'valid', label: `Válida hasta ${record.expiry_date}`, color: theme.green }
}

function ItvFormModal({ open, onClose, onSave, initial }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState(initial || {
    inspection_date: today, expiry_date: '', result: 'favorable',
    station: '', defects: '', cost: 0, notes: '', resolved: false,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auto-calculate expiry based on result
  const setResult = (r) => {
    set('result', r)
    if (r === 'negativa') set('expiry_date', '')
  }

  const handleSave = async () => {
    if (!form.inspection_date) return
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar ITV' : 'Nueva ITV'}>
      <ResponsiveGrid2>
        <Field label="Fecha inspección"><input style={css.input} type="date" value={form.inspection_date} onChange={e => set('inspection_date', e.target.value)} /></Field>
        <Field label="Fecha caducidad"><input style={css.input} type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} /></Field>
      </ResponsiveGrid2>

      <Field label="Resultado">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RESULTS.map(r => (
            <button key={r.value} onClick={() => setResult(r.value)} style={{
              ...css.btn(form.result === r.value ? r.color : theme.bg, form.result === r.value ? '#000' : theme.muted),
              flex: 1, justifyContent: 'center', border: `1px solid ${form.result === r.value ? r.color : theme.border}`,
              fontSize: 12, padding: '8px 10px', minWidth: 100,
            }}>{r.label}</button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
          {RESULTS.find(r => r.value === form.result)?.desc}
        </p>
      </Field>

      {(form.result === 'desfavorable' || form.result === 'negativa') && (
        <>
          <Field label="Defectos encontrados">
            <textarea style={{ ...css.input, minHeight: 70, resize: 'vertical' }} value={form.defects}
              onChange={e => set('defects', e.target.value)} placeholder="Describe los defectos..." />
          </Field>
          {form.result === 'desfavorable' && initial && (
            <Field label="¿Reparado y pasado?">
              <div style={{ display: 'flex', gap: 8 }}>
                {[false, true].map(v => (
                  <button key={String(v)} onClick={() => set('resolved', v)} style={{
                    ...css.btn(form.resolved === v ? (v ? theme.green : theme.bg) : theme.bg, form.resolved === v ? (v ? '#000' : theme.muted) : theme.muted),
                    flex: 1, justifyContent: 'center', border: `1px solid ${theme.border}`,
                  }}>{v ? '✅ Sí, reparado' : '⏳ Pendiente'}</button>
                ))}
              </div>
            </Field>
          )}
        </>
      )}

      <ResponsiveGrid2>
        <Field label="Estación ITV"><input style={css.input} value={form.station} onChange={e => set('station', e.target.value)} placeholder="Nombre estación" /></Field>
        <Field label="Coste (€)"><input style={css.input} type="number" value={form.cost} onChange={e => set('cost', +e.target.value)} /></Field>
      </ResponsiveGrid2>
      <Field label="Notas"><input style={css.input} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observaciones..." /></Field>

      <div style={{ ...css.flex, justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
        <button onClick={onClose} style={css.btnOutline}>Cancelar</button>
        <button onClick={handleSave} disabled={saving} style={css.btn()}><Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </Modal>
  )
}

export default function ItvCard({ carId, itvRecords, onReload, onToast, isMobile }) {
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const latest = itvRecords[0] || null
  const itvStatus = getItvStatus(latest)
  const isAlert = ['expired', 'failed', 'defects', 'soon'].includes(itvStatus.status)

  const handleSave = async (form) => {
    try {
      if (editRecord) {
        await updateItvRecord(editRecord.id, form)
        onToast('ITV actualizada')
      } else {
        await createItvRecord({ car_id: carId, ...form })
        onToast('ITV registrada')
      }
      setShowForm(false); setEditRecord(null); onReload()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  const handleDelete = async (id) => {
    try { await deleteItvRecord(id); onToast('Registro eliminado'); onReload() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  const StatusIcon = itvStatus.status === 'valid' || itvStatus.status === 'approaching'
    ? ShieldCheck : itvStatus.status === 'failed' || itvStatus.status === 'expired'
    ? ShieldX : itvStatus.status === 'none' ? ShieldAlert : ShieldAlert

  return (
    <>
      <div style={{
        ...css.card, marginBottom: 16, padding: isMobile ? 14 : 18,
        border: isAlert ? `1px solid ${itvStatus.color}40` : `1px solid ${theme.border}`,
        background: isAlert ? `${itvStatus.color}08` : theme.card,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: `${itvStatus.color}18`, borderRadius: 10, padding: 10, display: 'flex' }}>
              <StatusIcon size={22} color={itvStatus.color} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: theme.white }}>ITV</span>
                <span style={css.badge(`${itvStatus.color}20`, itvStatus.color)}>{itvStatus.label}</span>
              </div>
              {latest && (
                <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
                  Última: {latest.inspection_date} · {RESULTS.find(r => r.value === latest.result)?.label}
                  {latest.station ? ` · ${latest.station}` : ''}
                  {latest.defects && <span style={{ color: theme.yellow }}> · Defectos: {latest.defects}</span>}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {latest && (
              <button onClick={() => { setEditRecord(latest); setShowForm(true) }}
                style={css.btnSm(theme.accentSoft, theme.accent)}><Edit2 size={12} /></button>
            )}
            <button onClick={() => { setEditRecord(null); setShowForm(true) }}
              style={css.btnSm(theme.accent, '#000')}><Plus size={12} /> {isMobile ? '' : 'Nueva'}</button>
            {itvRecords.length > 1 && (
              <button onClick={() => setShowHistory(!showHistory)}
                style={css.btnSm(theme.bg, theme.muted)}>
                <Calendar size={12} /> {isMobile ? '' : 'Historial'}
              </button>
            )}
          </div>
        </div>

        {/* History */}
        {showHistory && itvRecords.length > 1 && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 12 }}>
            {itvRecords.slice(1).map(r => {
              const res = RESULTS.find(x => x.value === r.result)
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: theme.muted }}>{r.inspection_date}</span>
                    <span style={{ color: res?.color, fontWeight: 600, marginLeft: 8 }}>{res?.label}</span>
                    {r.station && <span style={{ color: theme.mutedLight, marginLeft: 8 }}>{r.station}</span>}
                    {r.defects && <span style={{ color: theme.yellow, marginLeft: 8 }}>{r.defects}</span>}
                  </div>
                  <button onClick={() => handleDelete(r.id)} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={11} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ItvFormModal
          open={showForm}
          onClose={() => { setShowForm(false); setEditRecord(null) }}
          onSave={handleSave}
          initial={editRecord ? {
            inspection_date: editRecord.inspection_date, expiry_date: editRecord.expiry_date,
            result: editRecord.result, station: editRecord.station || '', defects: editRecord.defects || '',
            cost: editRecord.cost || 0, notes: editRecord.notes || '', resolved: editRecord.resolved || false,
          } : null}
        />
      )}
    </>
  )
}
