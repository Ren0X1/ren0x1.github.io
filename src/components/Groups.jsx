import { useState, useEffect, useRef } from 'react'
import {
  Users, Plus, Trash2, Save, ChevronLeft, Send, MessageCircle,
  Car, UserPlus, X, Gauge, Calendar, Settings as SettingsIcon, Fuel, Eye
} from 'lucide-react'
import { theme, css } from '../lib/theme.js'
import { useIsMobile } from '../lib/useIsMobile.js'
import {
  getGroups, createGroup, deleteGroup, getGroupMembers,
  addGroupMember, removeGroupMember, getGroupMessages,
  sendGroupMessage, getProfiles, getMemberCars,
  getMaintenanceRecords, getCarParts, getItvRecords
} from '../lib/supabase.js'
import { getMaintStatus, MAINT_TYPES } from '../lib/constants.js'
import { Modal, Field, Loader, StatusBadge } from './ui.jsx'

/* ── Read-only Car Viewer ── */
function CarViewer({ car, onClose, isMobile }) {
  const [maint, setMaint] = useState([])
  const [parts, setParts] = useState([])
  const [itv, setItv] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMaintenanceRecords(car.id), getCarParts(car.id), getItvRecords(car.id)])
      .then(([m, p, i]) => { setMaint(m); setParts(p); setItv(i) })
      .finally(() => setLoading(false))
  }, [car.id])

  if (loading) return <Loader text="Cargando..." />

  const latest_itv = itv[0]
  let overdue = 0, warn = 0
  maint.forEach(m => { const s = getMaintStatus(m, car.current_km); if (s === 'overdue') overdue++; if (s === 'warn') warn++ })

  return (
    <div>
      <button onClick={onClose} style={{ ...css.btnOutline, marginBottom: 12, fontSize: 12 }}><ChevronLeft size={14} /> Volver</button>
      <div style={{ ...css.card, padding: isMobile ? 14 : 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <h3 style={{ ...css.h2, fontSize: 18 }}>{car.brand} {car.model}</h3>
          <span style={css.badge(theme.accentSoft, theme.accent)}>{car.plate}</span>
          <span style={{ ...css.flex, gap: 4, fontSize: 12, color: theme.muted }}><Gauge size={13} />{car.current_km?.toLocaleString()} km</span>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: theme.muted, flexWrap: 'wrap' }}>
          <span><Calendar size={12} /> {car.year}</span>
          <span><SettingsIcon size={12} /> {car.transmission}</span>
          <span><Fuel size={12} /> {car.fuel}</span>
          {overdue > 0 && <span style={css.badge(theme.redSoft, theme.red)}>⚠ {overdue} vencidos</span>}
          {warn > 0 && <span style={css.badge(theme.yellowSoft, theme.yellow)}>⏳ {warn} próximos</span>}
          {latest_itv && <span style={css.badge(
            latest_itv.result === 'favorable' ? theme.greenSoft : theme.yellowSoft,
            latest_itv.result === 'favorable' ? theme.green : theme.yellow
          )}>ITV: {latest_itv.result}</span>}
        </div>
      </div>

      {/* Maintenance summary */}
      {maint.length > 0 && (
        <div style={{ ...css.card, padding: 0, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 13, fontWeight: 600 }}>Mantenimientos</div>
          {maint.map(m => {
            const mt = MAINT_TYPES.find(t => t.id === m.type_id)
            const status = getMaintStatus(m, car.current_km)
            return (
              <div key={m.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{mt?.emoji} {mt?.name || m.type_id}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: theme.muted }}>{m.next_km?.toLocaleString()} km</span>
                  <StatusBadge status={status} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Parts */}
      {parts.length > 0 && (
        <div style={{ ...css.card, padding: 0, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontSize: 13, fontWeight: 600 }}>Recambios</div>
          {parts.map(p => (
            <div key={p.id} style={{ padding: '8px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={css.badge('rgba(59,130,246,0.12)', '#3b82f6')}>{p.reference || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Group Detail ── */
function GroupDetail({ group, user, onBack, onToast, isMobile }) {
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [memberCars, setMemberCars] = useState({})
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [viewingCar, setViewingCar] = useState(null)
  const [tab, setTab] = useState('chat')
  const [loading, setLoading] = useState(true)
  const chatEnd = useRef(null)
  const isAdmin = user.role === 'admin'

  const load = async () => {
    try {
      const [mem, msgs, profiles] = await Promise.all([
        getGroupMembers(group.id), getGroupMessages(group.id), getProfiles()
      ])
      setMembers(mem); setMessages(msgs); setAllProfiles(profiles)
      // Load cars for each member
      const cars = {}
      for (const m of mem) { cars[m.user_id] = await getMemberCars(m.user_id) }
      setMemberCars(cars)
    } catch (err) { onToast('Error: ' + err.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [group.id])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Poll for new messages every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      try { setMessages(await getGroupMessages(group.id)) } catch {}
    }, 10000)
    return () => clearInterval(interval)
  }, [group.id])

  const handleSend = async () => {
    if (!newMsg.trim()) return
    setSending(true)
    try {
      const msg = await sendGroupMessage(group.id, user.id, newMsg.trim())
      setMessages(prev => [...prev, msg]); setNewMsg('')
    } catch (err) { onToast('Error: ' + err.message, 'error') }
    finally { setSending(false) }
  }

  const handleAddMember = async (userId) => {
    try {
      await addGroupMember(group.id, userId)
      setShowAddMember(false); onToast('Miembro añadido'); load()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('¿Eliminar del grupo?')) return
    try { await removeGroupMember(group.id, userId); onToast('Miembro eliminado'); load() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  if (loading) return <Loader text="Cargando grupo..." />
  if (viewingCar) return <CarViewer car={viewingCar} onClose={() => setViewingCar(null)} isMobile={isMobile} />

  const nonMembers = allProfiles.filter(p => !members.find(m => m.user_id === p.id))
  const tabs = [
    { id: 'chat', icon: <MessageCircle size={14} />, label: 'Chat' },
    { id: 'cars', icon: <Car size={14} />, label: 'Coches' },
    { id: 'members', icon: <Users size={14} />, label: `${members.length}` },
  ]

  return (
    <div>
      <button onClick={onBack} style={{ ...css.btnOutline, marginBottom: 12 }}><ChevronLeft size={16} /> Grupos</button>
      <h2 style={{ ...css.h1, fontSize: isMobile ? 20 : 24, marginBottom: 16 }}>{group.name}</h2>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: theme.bg, borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center',
            background: tab === t.id ? theme.card : 'transparent', color: tab === t.id ? theme.white : theme.muted,
            border: tab === t.id ? `1px solid ${theme.border}` : '1px solid transparent',
            borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div style={{ ...css.card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 240px)' : 480 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {messages.length === 0 && <p style={{ color: theme.muted, textAlign: 'center', padding: 40, fontSize: 13 }}>Sin mensajes aún. ¡Escribe el primero!</p>}
            {messages.map(m => {
              const isMe = m.user_id === user.id
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{
                    maxWidth: '75%', padding: '8px 12px', borderRadius: 12,
                    background: isMe ? theme.accent + '22' : theme.bg,
                    borderBottomRightRadius: isMe ? 4 : 12, borderBottomLeftRadius: isMe ? 12 : 4,
                  }}>
                    {!isMe && <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent, marginBottom: 2 }}>{m.profiles?.name}</div>}
                    <div style={{ fontSize: 13, color: theme.text, wordBreak: 'break-word' }}>{m.message}</div>
                    <div style={{ fontSize: 10, color: theme.mutedLight, marginTop: 2, textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={chatEnd} />
          </div>
          <div style={{ borderTop: `1px solid ${theme.border}`, padding: 10, display: 'flex', gap: 8 }}>
            <input style={{ ...css.input, flex: 1 }} value={newMsg} onChange={e => setNewMsg(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} />
            <button onClick={handleSend} disabled={sending || !newMsg.trim()}
              style={{ ...css.btn(), padding: '8px 14px', opacity: !newMsg.trim() ? 0.5 : 1 }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Cars Tab */}
      {tab === 'cars' && (
        <div>
          {members.map(m => {
            const cars = memberCars[m.user_id] || []
            const profile = m.profiles
            if (cars.length === 0) return null
            return (
              <div key={m.user_id} style={{ marginBottom: 16 }}>
                <h3 style={{ ...css.h3, marginBottom: 8, fontSize: 14 }}>
                  🚗 Coches de {profile?.name || 'Usuario'}
                  {m.user_id === user.id && <span style={{ color: theme.muted, fontWeight: 400 }}> (tú)</span>}
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {cars.map(car => (
                    <div key={car.id} onClick={() => setViewingCar(car)}
                      style={{ ...css.card, padding: isMobile ? 12 : 16, cursor: 'pointer', marginBottom: 0, transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{car.brand} {car.model}</span>
                            <span style={css.badge(theme.accentSoft, theme.accent)}>{car.plate}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 12, color: theme.muted }}>
                            <span>{car.current_km?.toLocaleString()} km</span>
                            <span>{car.year}</span>
                            <span>{car.fuel}</span>
                          </div>
                        </div>
                        <Eye size={16} color={theme.muted} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div>
          {isAdmin && nonMembers.length > 0 && (
            <button onClick={() => setShowAddMember(true)} style={{ ...css.btn(), marginBottom: 12 }}>
              <UserPlus size={14} /> Añadir miembro
            </button>
          )}
          <div style={{ display: 'grid', gap: 8 }}>
            {members.map(m => (
              <div key={m.id} style={{ ...css.card, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.profiles?.name}</span>
                  <span style={{ color: theme.muted, fontSize: 12, marginLeft: 8 }}>@{m.profiles?.username}</span>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                    {(memberCars[m.user_id] || []).length} coche{(memberCars[m.user_id] || []).length !== 1 ? 's' : ''}
                  </div>
                </div>
                {isAdmin && m.user_id !== user.id && (
                  <button onClick={() => handleRemoveMember(m.user_id)} style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /></button>
                )}
              </div>
            ))}
          </div>

          {/* Add member modal */}
          <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="Añadir miembro">
            {nonMembers.length === 0 ? (
              <p style={{ color: theme.muted, textAlign: 'center', padding: 20 }}>Todos los usuarios ya están en el grupo</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {nonMembers.map(p => (
                  <div key={p.id} style={{ ...css.card, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: theme.muted, fontSize: 12, marginLeft: 8 }}>@{p.username}</span>
                    </div>
                    <button onClick={() => handleAddMember(p.id)} style={css.btnSm(theme.accent, '#000')}><Plus size={12} /> Añadir</button>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  )
}

/* ── Main Groups Page ── */
export default function Groups({ user, onToast }) {
  const mob = useIsMobile()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)
  const isAdmin = user.role === 'admin'

  const load = async () => {
    try { setGroups(await getGroups(user.id)) }
    catch (err) { onToast('Error: ' + err.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createGroup(newName.trim(), user.id)
      setNewName(''); setShowNew(false); onToast('Grupo creado'); load()
    } catch (err) { onToast('Error: ' + err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este grupo y todos sus mensajes?')) return
    try { await deleteGroup(id); onToast('Grupo eliminado'); load() }
    catch (err) { onToast('Error: ' + err.message, 'error') }
  }

  if (loading) return <Loader text="Cargando grupos..." />

  if (activeGroup) {
    return (
      <div style={css.container}>
        <div style={{ paddingTop: mob ? 16 : 24, paddingBottom: 40 }}>
          <GroupDetail group={activeGroup} user={user} onBack={() => { setActiveGroup(null); load() }} onToast={onToast} isMobile={mob} />
        </div>
      </div>
    )
  }

  return (
    <div style={css.container}>
      <div style={{ paddingTop: mob ? 20 : 28, paddingBottom: 40 }}>
        <div style={{ ...css.flexBetween, marginBottom: 20, gap: 12 }}>
          <div>
            <h1 style={{ ...css.h1, fontSize: mob ? 22 : 26 }}>Grupos</h1>
            <p style={css.subtitle}>{groups.length} grupo{groups.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowNew(true)} style={css.btn()}><Plus size={16} /> Crear grupo</button>
          )}
        </div>

        {groups.length === 0 ? (
          <div style={{ ...css.card, padding: 40, textAlign: 'center' }}>
            <Users size={40} color={theme.mutedLight} style={{ marginBottom: 12 }} />
            <p style={{ color: theme.muted, fontSize: 13 }}>
              {isAdmin ? 'No hay grupos. Crea uno para empezar.' : 'Aún no estás en ningún grupo.'}
            </p>
            {isAdmin && <button onClick={() => setShowNew(true)} style={{ ...css.btn(), marginTop: 12 }}><Plus size={14} /> Crear grupo</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {groups.map(g => (
              <div key={g.id} onClick={() => setActiveGroup(g)}
                style={{ ...css.card, padding: mob ? 14 : 20, cursor: 'pointer', transition: 'all .15s', marginBottom: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: theme.accentSoft, borderRadius: 10, padding: 10, display: 'flex' }}>
                      <Users size={20} color={theme.accent} />
                    </div>
                    <div>
                      <h3 style={css.h3}>{g.name}</h3>
                      <p style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                        Creado por {g.profiles?.name || 'admin'}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); handleDelete(g.id) }}
                      style={css.btnSm(theme.redSoft, theme.red)}><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuevo Grupo">
        <Field label="Nombre del grupo">
          <input style={css.input} value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Ej: Los Pibes" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
        </Field>
        <div style={{ ...css.flex, justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
          <button onClick={() => setShowNew(false)} style={css.btnOutline}>Cancelar</button>
          <button onClick={handleCreate} disabled={saving} style={css.btn()}>
            <Save size={14} /> {saving ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
