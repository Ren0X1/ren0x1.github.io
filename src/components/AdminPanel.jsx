import { useState, useEffect } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { getProfiles, createProfile, deleteProfile, getCars } from '../lib/supabase.js'
import { Modal, Field, Loader } from './ui.jsx'

export default function AdminPanel({ onToast }) {
  const [users, setUsers] = useState([])
  const [carCounts, setCarCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', username: '', pin: '1234', role: 'user' })
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      const profiles = await getProfiles()
      setUsers(profiles)
      const counts = {}
      for (const p of profiles) { const cars = await getCars(p.id); counts[p.id] = cars.length }
      setCarCounts(counts)
    } catch (err) { onToast('Error cargando usuarios: ' + err.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  const handleAdd = async () => {
    if (!newUser.name || !newUser.username) return
    setSaving(true)
    try {
      await createProfile(newUser)
      setNewUser({ name: '', username: '', pin: '1234', role: 'user' })
      setShowNew(false)
      onToast('Usuario creado correctamente')
      loadUsers()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar al usuario "${name}" y todos sus datos?`)) return
    try { await deleteProfile(id); onToast('Usuario eliminado'); loadUsers() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  if (loading) return <Loader text="Cargando usuarios..." />

  return (
    <div style={css.container}>
      <div style={{ paddingTop: 28, paddingBottom: 40 }}>
        <div style={{ ...css.flexBetween, marginBottom: 24 }}>
          <div>
            <h1 style={css.h1}>Administración</h1>
            <p style={css.subtitle}>Gestión de usuarios · {users.length} usuario{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNew(true)} style={css.btn()}><Plus size={16} /> Nuevo Usuario</button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {users.map(u => (
            <div key={u.id} style={css.card}>
              <div style={css.flexBetween}>
                <div>
                  <div style={{ ...css.flex, gap: 10, marginBottom: 4 }}>
                    <h3 style={css.h3}>{u.name}</h3>
                    <span style={css.badge(
                      u.role === 'admin' ? theme.accentSoft : theme.greenSoft,
                      u.role === 'admin' ? theme.accent : theme.green
                    )}>{u.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                  </div>
                  <p style={{ ...css.subtitle, marginTop: 4 }}>
                    @{u.username} · PIN: {u.pin} · {carCounts[u.id] || 0} coche{(carCounts[u.id] || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => handleDelete(u.id, u.name)} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /> Eliminar</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuevo Usuario">
          <Field label="Nombre"><input style={css.input} value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="Nombre" /></Field>
          <Field label="Usuario"><input style={css.input} value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} placeholder="nombre_usuario" /></Field>
          <Field label="PIN"><input style={css.input} value={newUser.pin} onChange={e => setNewUser(p => ({ ...p, pin: e.target.value }))} placeholder="1234" /></Field>
          <div style={{ ...css.flex, justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
            <button onClick={() => setShowNew(false)} style={css.btnOutline}>Cancelar</button>
            <button onClick={handleAdd} disabled={saving} style={css.btn()}><Save size={14} /> {saving ? 'Creando...' : 'Crear'}</button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
