import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Profiles ───

export async function login(email, pin) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .eq('pin', pin)
    .single()
  if (error || !data) throw new Error('Email o PIN incorrecto')
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

export async function createProfile({ name, email, pin, role = 'user' }) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, email, pin, role })
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
  // Check if record exists for this car + type
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
        last_km: record.last_km,
        last_date: record.last_date,
        next_km: record.next_km,
        next_date: record.next_date,
        cost: record.cost,
        notes: record.notes,
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
