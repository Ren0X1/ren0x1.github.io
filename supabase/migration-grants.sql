-- ╔══════════════════════════════════════════════════════════╗
-- ║  PIBES MECÁNICOS - Migración: Grants explícitos          ║
-- ║  Adapta el proyecto al cambio de Supabase                ║
-- ║  https://github.com/orgs/supabase/discussions/45329      ║
-- ║                                                          ║
-- ║  ¿Qué hace?                                              ║
-- ║  1. Asegura los GRANTs en TODAS las tablas actuales      ║
-- ║  2. Configura default privileges para que las tablas     ║
-- ║     que crees en el futuro también tengan los grants     ║
-- ║                                                          ║
-- ║  Después de esto, puedes crear nuevas tablas en public   ║
-- ║  y seguirán siendo accesibles desde la app sin hacer     ║
-- ║  nada extra, incluso después del 30 octubre 2026.        ║
-- ╚══════════════════════════════════════════════════════════╝

-- ─── 1. Grants explícitos en todas las tablas actuales ───
-- (Idempotente — no falla si ya están)

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ─── 2. Default privileges para tablas FUTURAS ───
-- Cualquier tabla que cree el rol postgres en public obtendrá estos grants automáticamente

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ─── Listo. Tu proyecto ya está preparado. ───
