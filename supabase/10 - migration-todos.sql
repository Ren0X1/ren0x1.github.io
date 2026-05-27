-- ╔══════════════════════════════════════════════════════════╗
-- ║  PIBES MECÁNICOS - Migración: TODO list por vehículo   ║
-- ║  Ejecutar en: Supabase Dashboard > SQL Editor           ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS vehicle_todos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id       UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  notes        TEXT DEFAULT '',
  priority     TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta')),
  completed    BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_todos_car ON vehicle_todos(car_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_todos_completed ON vehicle_todos(car_id, completed);

ALTER TABLE vehicle_todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_todos_all" ON vehicle_todos;
CREATE POLICY "vehicle_todos_all" ON vehicle_todos FOR ALL USING (true) WITH CHECK (true);
