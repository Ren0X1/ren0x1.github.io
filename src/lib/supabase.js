import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate env vars — prevents the cryptic "supabaseUrl is required" crash
if (!supabaseUrl || !supabaseKey) {
  const msg = '⚠️ Faltan las variables de entorno de Supabase.\n\n'
    + 'Si estás en local: crea un fichero .env con:\n'
    + '  VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n'
    + '  VITE_SUPABASE_ANON_KEY=tu-anon-key\n\n'
    + 'Si estás en GitHub Pages: añade los secrets en\n'
    + '  Settings > Secrets and variables > Actions\n'
    + '  y vuelve a lanzar el deploy.'
  document.body.innerHTML = `<pre style="color:#f59e0b;background:#0b0b12;padding:40px;font-size:14px;white-space:pre-wrap">${msg}</pre>`
  throw new Error('Missing Supabase env vars')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Profiles ───

export async function login(username, pin) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username.trim())
    .eq('pin', pin)
    .single()
  if (error || !data) throw new Error('Usuario o PIN incorrecto')
  return data
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

export async function createProfile({ name, username, pin, role = 'user' }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, username: username.toLowerCase().trim(), pin, role })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProfile(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}

// ─── Cars ───

export async function getCars(userId) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createCar(car) {
  const { data, error } = await supabase
    .from('cars')
    .insert(car)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCar(id, updates) {
  const { data, error } = await supabase
    .from('cars')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCar(id) {
  const { error } = await supabase.from('cars').delete().eq('id', id)
  if (error) throw error
}

// ─── KM Logs ───

export async function getKmLogs(carId) {
  const { data, error } = await supabase
    .from('km_logs')
    .select('*')
    .eq('car_id', carId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createKmLog(log) {
  const { data, error } = await supabase
    .from('km_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteKmLog(id) {
  const { error } = await supabase.from('km_logs').delete().eq('id', id)
  if (error) throw error
}

// ─── Maintenance Records ───

export async function getMaintenanceRecords(carId) {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('car_id', carId)
  if (error) throw error
  return data
}

export async function upsertMaintenanceRecord(record) {
  const { data: existing } = await supabase
    .from('maintenance_records')
    .select('id')
    .eq('car_id', record.car_id)
    .eq('type_id', record.type_id)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({
        last_km: record.last_km, last_date: record.last_date,
        next_km: record.next_km, next_date: record.next_date,
        cost: record.cost, notes: record.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(record)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function deleteMaintenanceRecord(carId, typeId) {
  const { error } = await supabase
    .from('maintenance_records')
    .delete()
    .eq('car_id', carId)
    .eq('type_id', typeId)
  if (error) throw error
}

// ─── Car Parts (Recambios) ───

export async function getCarParts(carId) {
  const { data, error } = await supabase
    .from('car_parts')
    .select('*')
    .eq('car_id', carId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createCarPart(part) {
  const { data, error } = await supabase
    .from('car_parts')
    .insert(part)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCarPart(id) {
  const { error } = await supabase.from('car_parts').delete().eq('id', id)
  if (error) throw error
}

// ─── Fuel Logs (Repostajes) ───

export async function getFuelLogs(carId) {
  const { data, error } = await supabase
    .from('fuel_logs')
    .select('*')
    .eq('car_id', carId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createFuelLog(log) {
  const { data, error } = await supabase
    .from('fuel_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFuelLog(id) {
  const { error } = await supabase.from('fuel_logs').delete().eq('id', id)
  if (error) throw error
}

// ─── Vehicle Todos ───

export async function getVehicleTodos(carId) {
  const { data, error } = await supabase
    .from('vehicle_todos')
    .select('*')
    .eq('car_id', carId)
    .order('completed')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createVehicleTodo(todo) {
  const { data, error } = await supabase
    .from('vehicle_todos')
    .insert(todo)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateVehicleTodo(id, updates) {
  const { data, error } = await supabase
    .from('vehicle_todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVehicleTodo(id) {
  const { error } = await supabase.from('vehicle_todos').delete().eq('id', id)
  if (error) throw error
}

// ─── Reminders (personal user reminders) ───

export async function getReminders(userId) {
  const { data, error } = await supabase
    .from('reminders')
    .select('*, cars(brand, model, plate, vehicle_type)')
    .eq('user_id', userId)
    .order('completed')
    .order('due_date')
  if (error) throw error
  return data
}

export async function createReminder(reminder) {
  const { data, error } = await supabase
    .from('reminders')
    .insert(reminder)
    .select('*, cars(brand, model, plate, vehicle_type)')
    .single()
  if (error) throw error
  return data
}

export async function updateReminder(id, updates) {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select('*, cars(brand, model, plate, vehicle_type)')
    .single()
  if (error) throw error
  return data
}

export async function deleteReminder(id) {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
}

// ─── Workshops (Talleres) ───

export async function getWorkshops() {
  const { data, error } = await supabase
    .from('workshops')
    .select('*, profiles(name)')
    .order('rating', { ascending: false })
  if (error) throw error
  return data
}

export async function createWorkshop(ws) {
  const { data, error } = await supabase
    .from('workshops')
    .insert(ws)
    .select('*, profiles(name)')
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkshop(id) {
  const { error } = await supabase.from('workshops').delete().eq('id', id)
  if (error) throw error
}

export async function updateWorkshop(id, updates) {
  const { data, error } = await supabase
    .from('workshops')
    .update(updates)
    .eq('id', id)
    .select('*, profiles(name)')
    .single()
  if (error) throw error
  return data
}

// ─── Expense helpers ───

export async function getAllExpenses(carId) {
  const [maint, fuel] = await Promise.all([
    getMaintenanceRecords(carId),
    getFuelLogs(carId),
  ])
  return { maint, fuel }
}

// ─── ITV Records ───

export async function getItvRecords(carId) {
  const { data, error } = await supabase
    .from('itv_records')
    .select('*')
    .eq('car_id', carId)
    .order('inspection_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createItvRecord(record) {
  const { data, error } = await supabase
    .from('itv_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateItvRecord(id, updates) {
  const { data, error } = await supabase
    .from('itv_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteItvRecord(id) {
  const { error } = await supabase.from('itv_records').delete().eq('id', id)
  if (error) throw error
}

// ─── Groups ───

export async function getGroups(userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, created_by, created_at, profiles(name))')
    .eq('user_id', userId)
  if (error) throw error
  return data.map(gm => gm.groups).filter(Boolean)
}

export async function createGroup(name, createdBy) {
  const { data, error } = await supabase
    .from('groups')
    .insert({ name, created_by: createdBy })
    .select()
    .single()
  if (error) throw error
  await supabase.from('group_members').insert({ group_id: data.id, user_id: createdBy })
  return data
}

export async function deleteGroup(id) {
  const { error } = await supabase.from('groups').delete().eq('id', id)
  if (error) throw error
}

export async function getGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles(id, name, username)')
    .eq('group_id', groupId)
  if (error) throw error
  return data
}

export async function addGroupMember(groupId, userId) {
  const { data, error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeGroupMember(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function getGroupMessages(groupId) {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*, profiles(name)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(200)
  if (error) throw error
  return data
}

export async function sendGroupMessage(groupId, userId, message) {
  const { data, error } = await supabase
    .from('group_messages')
    .insert({ group_id: groupId, user_id: userId, message })
    .select('*, profiles(name)')
    .single()
  if (error) throw error
  return data
}

export async function getMemberCars(userId) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data
}
