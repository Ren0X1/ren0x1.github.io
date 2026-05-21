[![Deploy to GitHub Pages](https://github.com/Ren0X1/ren0x1.github.io/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/Ren0X1/ren0x1.github.io/actions/workflows/deploy.yml)
# 🔧 Pibes Mecánicos

App de control de mantenimiento de vehículos para ti y tus amigos. Gratis, desplegada en GitHub Pages con Supabase como base de datos.

## 🚀 Setup paso a paso

### Paso 1: Crear proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New Project"**
3. Pon de nombre `pibes-mecanicos`, elige una contraseña y la región más cercana (EU West)
4. Espera ~2 minutos a que se cree

### Paso 2: Crear las tablas

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono en el menú lateral)
2. Click en **"New query"**
3. Copia y pega TODO el contenido de `supabase/schema.sql`
4. Click en **"Run"**
5. ✅ Deberías ver "Success" — las tablas están creadas

> ⚠️ Si ya tenías la versión anterior con email, usa `supabase/migration.sql` en vez del schema completo.

### Paso 3: Conseguir las credenciales

1. En Supabase, ve a **Settings** > **API**
2. Copia estos dos valores:
   - **Project URL**: `https://abcdefg.supabase.co`
   - **anon public key**: cadena larga que empieza por `eyJ...`

### Paso 4: Configurar secrets en GitHub

1. En tu repo, ve a **Settings** > **Secrets and variables** > **Actions**
2. Click **"New repository secret"** y añade:

| Nombre                     | Valor                              |
|----------------------------|------------------------------------|
| `VITE_SUPABASE_URL`       | Tu Project URL de Supabase         |
| `VITE_SUPABASE_ANON_KEY`  | Tu anon public key de Supabase     |

### Paso 5: Activar GitHub Pages

1. En tu repo, ve a **Settings** > **Pages**
2. En **Source**, selecciona **GitHub Actions**
3. Haz push y espera al deploy

### Paso 6: ¡Listo!

```
https://ren0x1.github.io/
```

## 🖥️ Desarrollo local

```bash
npm install
cp .env.example .env    # edita con tus credenciales
npm run dev
```

## 👤 Credenciales por defecto

| Nombre  | Usuario  | PIN  | Rol   |
|---------|----------|------|-------|
| Admin   | admin    | 1234 | admin |
| Carlos  | carlos   | 1234 | user  |
| Miguel  | miguel   | 1234 | user  |

## 📋 Funcionalidades

- **18 mantenimientos** con intervalos automáticos por km y meses
- **Recambios por coche** — tabla libre con nombre, referencia y enlace
- **Registro de kilómetros** con historial
- **Panel de admin** para crear/eliminar usuarios
- **Alertas visuales** semáforo (verde/amarillo/rojo)

## 🛠️ Stack

- **Frontend**: React + Vite
- **Base de datos**: Supabase (PostgreSQL gratuito)
- **Hosting**: GitHub Pages (gratuito)
