-- ╔══════════════════════════════════════════════════════════╗
-- ║  PIBES MECÁNICOS - Migración: Grupos con solicitudes     ║
-- ║  e invitaciones                                          ║
-- ║  Ejecutar en: Supabase Dashboard > SQL Editor           ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── 1. Estado de los grupos ───
-- pending  = solicitado por un usuario, esperando aprobación del admin
-- approved = activo
-- rejected = rechazado por el admin
ALTER TABLE groups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Los grupos existentes se quedan como 'approved' (no se rompe nada)
UPDATE groups SET status = 'approved' WHERE status IS NULL;

-- created_by ya existe y hace de "admin del grupo"

-- ─── 2. Invitaciones a grupos ───
CREATE TABLE IF NOT EXISTS group_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_user ON group_invitations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group ON group_invitations(group_id);

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_invitations_all" ON group_invitations;
CREATE POLICY "group_invitations_all" ON group_invitations FOR ALL USING (true) WITH CHECK (true);

-- Grants (por el cambio de Supabase de oct 2026)
GRANT SELECT, INSERT, UPDATE, DELETE ON group_invitations TO anon, authenticated, service_role;
