-- ╔══════════════════════════════════════════════════════════╗
-- ║  PIBES MECÁNICOS - Schema para Supabase                ║
-- ║  Ejecutar en: Supabase Dashboard > SQL Editor           ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── 1. Tablas ───

CREATE TABLE profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  pin        TEXT NOT NULL DEFAULT '1234',
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cars (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plate        TEXT NOT NULL,
  brand        TEXT NOT NULL,
  model        TEXT NOT NULL,
  year         INTEGER NOT NULL,
  transmission TEXT NOT NULL DEFAULT 'Manual',
  fuel         TEXT NOT NULL DEFAULT 'Gasolina',
  current_km   INTEGER NOT NULL DEFAULT 0,
  notes        TEXT DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE km_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id     UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  km         INTEGER NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE maintenance_records (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id     UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  type_id    TEXT NOT NULL,
  last_km    INTEGER NOT NULL DEFAULT 0,
  last_date  DATE,
  next_km    INTEGER NOT NULL DEFAULT 0,
  next_date  DATE,
  cost       NUMERIC(10,2) DEFAULT 0,
  notes      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(car_id, type_id)
);

-- ─── 2. Índices ───

CREATE INDEX idx_cars_user ON cars(user_id);
CREATE INDEX idx_km_logs_car ON km_logs(car_id);
CREATE INDEX idx_maintenance_car ON maintenance_records(car_id);
CREATE INDEX idx_maintenance_car_type ON maintenance_records(car_id, type_id);

-- ─── 3. Row Level Security ───
-- Usamos el anon key sin auth real, así que permitimos acceso completo.
-- Si más adelante quieres más seguridad, puedes integrar Supabase Auth
-- y cambiar las policies a auth.uid() = user_id.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE km_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Policies permisivas para anon (necesario con RLS habilitado)
CREATE POLICY "profiles_all" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cars_all" ON cars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "km_logs_all" ON km_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "maintenance_all" ON maintenance_records FOR ALL USING (true) WITH CHECK (true);

-- ─── 4. Datos iniciales ───
-- ¡Cambia estos datos con tus nombres reales!

INSERT INTO profiles (name, email, pin, role) VALUES
  ('Admin', 'admin@pibesmecanicos.com', '1234', 'admin'),
  ('Carlos', 'carlos@email.com', '1234', 'user'),
  ('Miguel', 'miguel@email.com', '1234', 'user');

-- ─── Listo! ───
-- Ahora copia la URL y anon key de tu proyecto Supabase
-- y pégalas en el fichero .env de tu proyecto.
