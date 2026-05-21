# 🔧 Pibes Mecánicos

App de control de mantenimiento de vehículos para ti y tus amigos. Gratis, desplegada en GitHub Pages con Supabase como base de datos.

## 🚀 Setup paso a paso

### Paso 1: Crear proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New Project"**
3. Pon de nombre `pibes-mecanicos`, elige una contraseña y la región más cercana (EU West)
4. Espera ~2 minutos a que se cree

### Paso 2: Crear las tablas

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de terminal en el menú lateral)
2. Click en **"New query"**
3. Copia y pega TODO el contenido del fichero `supabase/schema.sql`
4. Click en **"Run"**
5. ✅ Deberías ver "Success. No rows returned" — las tablas están creadas

### Paso 3: Conseguir las credenciales

1. En Supabase, ve a **Settings** > **API** (o Project Settings > API)
2. Copia estos dos valores:
   - **Project URL**: algo como `https://abcdefg.supabase.co`
   - **anon public key**: una cadena larga que empieza por `eyJ...`

### Paso 4: Crear el repo en GitHub

1. Crea un nuevo repositorio en GitHub llamado `pibes-mecanicos`
2. Sube todos los ficheros de este proyecto al repo

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/pibes-mecanicos.git
git branch -M main
git push -u origin main
```

### Paso 5: Configurar los secrets en GitHub

1. En tu repo de GitHub, ve a **Settings** > **Secrets and variables** > **Actions**
2. Click **"New repository secret"** y añade estos dos:

| Nombre                     | Valor                              |
|----------------------------|------------------------------------|
| `VITE_SUPABASE_URL`       | Tu Project URL de Supabase         |
| `VITE_SUPABASE_ANON_KEY`  | Tu anon public key de Supabase     |

### Paso 6: Activar GitHub Pages

1. En tu repo, ve a **Settings** > **Pages**
2. En **Source**, selecciona **GitHub Actions**
3. Haz un push o ejecuta el workflow manualmente desde **Actions** > **Deploy to GitHub Pages** > **Run workflow**

### Paso 7: ¡Listo!

Tu app estará disponible en:
```
https://TU_USUARIO.github.io/pibes-mecanicos/
```

## 🖥️ Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear fichero .env con tus credenciales
cp .env.example .env
# Edita .env con tu URL y key de Supabase

# 3. Arrancar en modo desarrollo
npm run dev
```

La app se abrirá en `http://localhost:5173`

## 👤 Credenciales por defecto

| Usuario | Email                        | PIN  | Rol   |
|---------|------------------------------|------|-------|
| Admin   | admin@pibesmecanicos.com     | 1234 | admin |
| Carlos  | carlos@email.com             | 1234 | user  |
| Miguel  | miguel@email.com             | 1234 | user  |

> ⚠️ Cambia los emails, nombres y PINs en `supabase/schema.sql` ANTES de ejecutar el SQL, o cámbialos después desde el panel de Admin de la app.

## 📋 Mantenimientos incluidos

Aceite Motor · Filtro Aceite · Filtro Aire · Filtro Habitáculo · Pastillas Freno (del/tras) · Discos Freno · Neumáticos · Correa Distribución · Líquido Frenos · Refrigerante · Bujías · Aceite Diferencial · Aceite Caja Cambios · Embrague · Batería · Amortiguadores · Escobillas Limpiaparabrisas

Cada uno con intervalos por defecto de km y meses que se autocompletan al registrar un mantenimiento.

## 🛠️ Stack

- **Frontend**: React + Vite
- **Base de datos**: Supabase (PostgreSQL gratuito)
- **Hosting**: GitHub Pages (gratuito)
- **UI**: Custom dark theme con iconos Lucide
