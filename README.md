# 🔧 Pibes Mecánicos

> El taller de los pibes — app web para llevar el control del mantenimiento de tus vehículos entre amigos.

Aplicación web responsive (PWA instalable en iPhone/Android) para registrar y seguir el mantenimiento de coches y motos: revisiones, ITV, repostajes con consumo, gastos, recambios, tareas pendientes y mucho más. Pensada para un grupo de amigos que comparten información de sus vehículos.

---

## ✨ Funcionalidades

### 🚗 Vehículos
- Coches y motos, con tipo de combustible y transmisión.
- Kilometraje actual e historial de km.
- Mantenimientos filtrados según tipo de vehículo y combustible (las bujías no salen en diésel, los calentadores solo en diésel, cadena/kit de arrastre solo en moto, etc.).
- Más de 18 tipos de mantenimiento con intervalos por km y por meses. Se puede registrar solo por km, solo por fecha, o ambos.
- Recambios con referencia y enlace de compra.
- **ITV** con resultado (favorable / desfavorable / negativa), defectos, caducidad y avisos de vencimiento.
- **Repostajes** con cálculo de consumo por depósito, modo de conducción (ciudad / mixto / carretera) y consumo medio.
- **Gastos** con gráficos por mes y por categoría, y coste por kilómetro.
- **Tareas (TODO)** por vehículo con prioridad (baja / media / alta).

### 📊 Resumen
- Estadísticas agregadas de todos tus vehículos: gasto total, mantenimiento, combustible, km totales.
- Tabla de gastos por vehículo con coste/km.
- Gráficos de gasto mensual y distribución por vehículo.

### 🔔 Recordatorios y notificaciones
- Recordatorios personales con fecha y vehículo opcional (seguros, ITVs, compras...).
- Centro de notificaciones con avisos de mantenimientos vencidos/próximos, ITVs por caducar, recordatorios e invitaciones a grupos. Se actualiza al instante.

### 👥 Grupos
- Los usuarios **solicitan** crear un grupo; un admin lo aprueba.
- El creador del grupo se convierte en **admin del grupo** y puede **invitar** a otros.
- Los invitados **deciden** si entrar o no.
- Chat de grupo y visor de vehículos de los miembros (solo lectura).

### 🔧 Talleres
- Directorio compartido de talleres con valoración, especialidad y teléfono.
- Botones de **llamar** y **WhatsApp** directos.

### 🛡️ Panel de administración
- Gestión de usuarios separados en **administradores** y **usuarios**.
- Crear, editar (nombre, usuario, rol) y eliminar usuarios.
- **Restablecer PIN** directamente o forzar cambio de PIN.
- Aprobar / rechazar solicitudes de grupos.
- Estadísticas globales con gráficos.

### 📄 Exportación
- **PDF** profesional con portada, KPIs, estado general y secciones detalladas.
- **Excel** con estilos (hojas por sección, colores, totales, formatos de número).

### 🎨 Otros
- Tema **oscuro** (por defecto) y **claro**, con toggle.
- Idioma español, fechas en formato DD/MM/AAAA.
- Login por usuario + PIN con bloqueo progresivo ante intentos fallidos.
- Diseño **mobile-first** con navegación inferior en móvil.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Iconos | lucide-react |
| Gráficos | recharts |
| PDF | jspdf + jspdf-autotable |
| Excel | exceljs |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | GitHub Pages (deploy automático con GitHub Actions) |

---

## 🚀 Puesta en marcha

### 1. Base de datos (Supabase)
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor** y ejecuta el contenido de `supabase/schema-completo.sql`. Es idempotente: crea todas las tablas, índices, políticas y permisos. Crea también un usuario admin por defecto (`admin` / `1234`).
3. En **Project Settings → API**, copia la `URL` y la `anon key`.

### 2. Variables de entorno
En GitHub, ve a **Settings → Secrets and variables → Actions** y crea:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Para desarrollo local, crea un fichero `.env` en la raíz:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Desarrollo local
```bash
npm install
npm run dev
```

### 4. Despliegue
Cada push a la rama `master` despliega automáticamente en GitHub Pages mediante el workflow de `.github/workflows/`.

---

## 🗄️ Migraciones de base de datos

El fichero `supabase/schema-completo.sql` contiene el esquema completo y actualizado. Para cambios incrementales sobre una base de datos existente, en la carpeta `supabase/` hay migraciones individuales que se pueden ejecutar en el SQL Editor.

> **Nota sobre Supabase (oct 2026):** a partir del 30/10/2026 Supabase no expone automáticamente las tablas nuevas a la API. El esquema ya incluye los `GRANT` explícitos y los *default privileges* necesarios, así que las tablas que crees seguirán siendo accesibles. Si tienes dudas, ejecuta `supabase/migration-grants.sql`.

---

## 🔐 Acceso por defecto

- **Usuario:** `admin`
- **PIN:** `1234`

> Cambia el PIN del admin en cuanto entres por primera vez.

---

## 📁 Estructura del proyecto

```
src/
  App.jsx                 # Routing de vistas, tema, cambio de PIN
  lib/
    supabase.js           # Todas las funciones de base de datos
    theme.js              # Tema reactivo oscuro/claro
    constants.js          # Tipos de mantenimiento, helpers de fechas
    pdfExport.js          # Exportación a PDF
    excelExport.js        # Exportación a Excel
    useIsMobile.js        # Hook responsive
  components/
    Login.jsx             # Login + bloqueo por intentos
    Nav.jsx               # Navegación (superior en desktop, inferior en móvil)
    Dashboard.jsx         # Lista de vehículos
    CarDetail.jsx         # Detalle del vehículo con pestañas
    UserStats.jsx         # Resumen global
    Reminders.jsx         # Recordatorios personales
    Groups.jsx            # Grupos, invitaciones y chat
    Workshops.jsx         # Directorio de talleres
    AdminPanel.jsx        # Panel de administración
    NotificationCenter.jsx# Centro de notificaciones
    ...
supabase/
  schema-completo.sql     # Esquema completo (ejecutar para empezar)
  migration-*.sql         # Migraciones incrementales
```

---

Hecho con 🔧 y 🍺 para los pibes.
