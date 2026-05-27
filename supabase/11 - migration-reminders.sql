-- ╔══════════════════════════════════════════════════════════╗
-- ║  PIBES MECÁNICOS - Migración: Recordatorios personales ║
-- ║  Ejecutar en: Supabase Dashboard > SQL Editor           ║
-- ╚══════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id       UUID REFERENCES cars(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  notes        TEXT DEFAULT '',
  due_date     DATE NOT NULL,
  completed    BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON reminders(user_id, completed, due_date);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_all" ON reminders;
CREATE POLICY "reminders_all" ON reminders FOR ALL USING (true) WITH CHECK (true);
