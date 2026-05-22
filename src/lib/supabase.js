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

// ─── Expense helpers ───

export async function getAllExpenses(carId) {
  const [maint, fuel] = await Promise.all([
    getMaintenanceRecords(carId),
    getFuelLogs(carId),
  ])
  return { maint, fuel }
}
