[![Deploy to GitHub Pages](https://github.com/Ren0X1/ren0x1.github.io/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/Ren0X1/ren0x1.github.io/actions/workflows/deploy.yml)

<div align="center">
  <img src="public/icon-512.png" alt="Pibes Mecánicos" width="120" />
  <h1>🔧 Pibes Mecánicos</h1>
  <p><strong>El taller de los pibes</strong></p>
  <p>App de control de mantenimiento de vehículos para ti y tus amigos.<br/>Gratis, instalable en el móvil, desplegada en GitHub Pages con Supabase.</p>
  <p>
    <a href="https://ren0x1.github.io/">🌐 Ver la app</a>
  </p>
</div>

---

## ✨ Funcionalidades

### 🚗 Gestión de vehículos
Registra tus coches con matrícula, marca, modelo, año, tipo de transmisión (manual/automático) y combustible. Cada coche tiene su propio panel con toda la información organizada en pestañas.

### 🔧 Control de mantenimientos
18 tipos de mantenimiento predefinidos con intervalos recomendados por kilómetros y meses: aceite motor, filtros (aceite, aire, habitáculo), pastillas y discos de freno, neumáticos, correa de distribución, líquido de frenos, refrigerante, bujías, diferencial, caja de cambios, embrague, batería, amortiguadores y escobillas. Sistema de alertas semáforo — verde (al día), amarillo (próximo a vencer), rojo (vencido). Al registrar un mantenimiento se autocompleta la fecha y km del próximo cambio.

### 📋 Recambios
Tabla libre por coche donde apuntar las piezas que usa: nombre, referencia del fabricante y enlace para comprar. Ideal para no tener que buscar cada vez qué filtro o pastillas lleva tu coche.

### 🔍 ITV
Registro completo de inspecciones técnicas con tres estados: favorable, desfavorable y negativa. Si no pasa, puedes apuntar los defectos y marcar cuando los hayas reparado. Alerta automática cuando la ITV está próxima a caducar (30/60 días) o ya ha caducado. Historial de todas las inspecciones con estación, coste y notas.

### ⛽ Repostajes
Registra cada vez que echas combustible: km, litros, precio por litro, si llenaste el depósito y notas. La app calcula automáticamente el consumo medio (L/100km) comparando repostajes consecutivos de depósito lleno, el gasto total en combustible y el precio medio por litro.

### 📊 Gastos
Gráfico de barras apiladas de los últimos 12 meses desglosando mantenimiento vs combustible. Gráfico de donut con el desglose por categoría (aceite, neumáticos, combustible…). Resumen con total gastado, gasto en mantenimiento, gasto en combustible y acumulado del año actual.

### 📄 Exportar PDF
Botón en la cabecera de cada coche que genera un informe PDF completo con datos del vehículo, tabla de mantenimientos con colores por estado, recambios, repostajes y historial de kilómetros. Paginación automática.

### 📏 Registro de kilómetros
Historial de km por fecha con notas. Al registrar km el coche se actualiza siempre al valor introducido (sin restricción de "solo subir"). Cada registro se puede borrar y el coche recalcula sus km al último registro restante.

### 👥 Grupos
Sistema de grupos creado por admins donde se añaden los usuarios. Dentro de cada grupo hay tres pestañas: **Chat** en tiempo real (polling cada 10s) con burbujas tipo WhatsApp, **Coches** compartidos en modo lectura donde puedes ver mantenimientos, recambios e ITV de los coches de cualquier miembro, y **Miembros** con gestión de altas y bajas.

### 🔧 Directorio de talleres
Directorio compartido entre todos los usuarios con nombre, teléfono (clickable para llamar), dirección, especialidad, valoración con estrellas y notas. Los admins pueden borrar y editar cualquier taller. Los usuarios normales solo pueden editar y borrar los que ellos han creado.

### 👤 Gestión de usuarios
Login por nombre de usuario + PIN numérico. Panel de administración donde el admin puede crear y eliminar usuarios. Sesión guardada en sessionStorage.

### 📱 Diseño responsive + PWA
Diseño adaptado para móvil con layout específico: navbar compacta con solo iconos, tarjetas de mantenimiento en vez de tabla, stats en grid 2x2, formularios en una columna, modales full-screen. Teclado numérico en móvil para PIN, fechas, km, precios y litros. Fechas en formato español (DD/MM/AAAA). Instalable en la pantalla de inicio del iPhone con icono personalizado.

---

## 🚀 Setup

### 1. Crear proyecto en Supabase (gratis)

Ve a [supabase.com](https://supabase.com), crea una cuenta y un nuevo proyecto con la región EU West.

### 2. Crear las tablas

En Supabase → **SQL Editor** → **New query**, pega el contenido de `supabase/schema.sql` y ejecuta. Si vienes de una versión anterior, ejecuta los ficheros `migration-*.sql` en orden.

### 3. Conseguir las credenciales

En Supabase → **Settings** → **API**, copia:

| Valor | Dónde está |
|---|---|
| **Project URL** | `https://xxxxx.supabase.co` |
| **anon public key** | Cadena que empieza por `eyJ...` |

### 4. Configurar secrets en GitHub

En tu repo → **Settings** → **Secrets and variables** → **Actions**, añade:

| Secret | Valor |
|---|---|
| `VITE_SUPABASE_URL` | Tu Project URL |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key |

### 5. Activar GitHub Pages

En tu repo → **Settings** → **Pages** → Source: **GitHub Actions**. Haz push y espera al deploy.

---

## 🖥️ Desarrollo local

```bash
npm install
cp .env.example .env    # edita con tus credenciales de Supabase
npm run dev
```

---

## 👤 Credenciales por defecto

| Nombre | Usuario | PIN | Rol |
|---|---|---|---|
| Admin | admin | 1234 | admin |
| Carlos | carlos | 1234 | user |
| Miguel | miguel | 1234 | user |

> Cambia los nombres, usuarios y PINs en `supabase/schema.sql` antes de ejecutarlo, o desde el panel de Admin de la app.

---

## 🗃️ Base de datos

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios (nombre, usuario, pin, rol) |
| `cars` | Coches (matrícula, marca, modelo, km...) |
| `km_logs` | Historial de kilómetros |
| `maintenance_records` | Registros de mantenimiento por tipo |
| `car_parts` | Recambios por coche |
| `fuel_logs` | Repostajes (litros, precio, consumo) |
| `itv_records` | Inspecciones ITV (resultado, defectos, caducidad) |
| `workshops` | Directorio de talleres compartido |
| `groups` | Grupos de usuarios |
| `group_members` | Miembros de cada grupo |
| `group_messages` | Mensajes del chat de grupo |

---

## 🛠️ Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 |
| Iconos | Lucide React |
| Gráficos | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |
| Base de datos | Supabase (PostgreSQL gratuito) |
| Hosting | GitHub Pages (gratuito) |
| Deploy | GitHub Actions |
| PWA | manifest.json + apple-touch-icon |
