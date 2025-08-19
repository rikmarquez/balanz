# BALANZ - ESPECIFICACIONES DE LA APLICACION

*Documento de especificaciones tecnicas y funcionales*  
*Fecha: 18 de Agosto 2025*

---

## DESCRIPCION GENERAL

**Balanz** es una aplicacion web completa de gestion financiera personal desarrollada con tecnologias modernas. Permite a los usuarios controlar sus finanzas mediante el seguimiento de ingresos, gastos, cuentas de efectivo, tarjetas de credito y analisis detallados.

### Informacion del Proyecto
- **Nombre**: Balanz
- **Tipo**: Aplicacion web full-stack
- **Estado**: COMPLETADO AL 100% - Listo para produccion
- **URL Local**: http://localhost:3002
- **Repositorio**: https://github.com/rikmarquez/balanz

---

## ARQUITECTURA TECNICA

### Stack Tecnologico
```
Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

Backend:
- Next.js API Routes
- Drizzle ORM
- Zod (Validaciones)

Base de Datos:
- PostgreSQL (Railway)
- Migraciones automaticas

Autenticacion:
- NextAuth.js
- Google OAuth Provider
- Credentials Provider

Despliegue:
- Railway (Auto-deployment)
- GitHub Integration
```

### Estructura del Proyecto
```
balanz/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── dashboard/         # Paginas principales
│   │   ├── auth/              # Autenticacion
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes base
│   │   ├── dashboard/         # Dashboard especificos
│   │   ├── transactions/      # Gestion de transacciones
│   │   ├── accounts/          # Cuentas de efectivo
│   │   ├── credit-cards/      # Tarjetas de credito
│   │   └── layout/            # Layout y navegacion
│   ├── lib/                   # Librerias y servicios
│   │   ├── db/                # Esquemas de base de datos
│   │   ├── services/          # Logica de negocio
│   │   └── auth.ts            # Configuracion NextAuth
│   └── middleware.ts          # Middleware de autenticacion
├── drizzle/                   # Migraciones de BD
├── docs/                      # Documentacion
└── public/                    # Archivos estaticos
```

---

## FUNCIONALIDADES PRINCIPALES

### DASHBOARD PRINCIPAL
- **Resumen financiero**: Balance total, ingresos y gastos del mes
- **Metricas de cuentas**: Numero de cuentas activas y balance consolidado
- **Metricas de tarjetas**: Credito total, deuda actual y disponible
- **Transacciones recientes**: Lista de ultimas 10 transacciones
- **Acciones rapidas**: Botones para crear transacciones, cuentas y tarjetas
- **Navegacion responsiva**: Sidebar colapsable con menu hamburguesa

### GESTION DE CUENTAS DE EFECTIVO
- **CRUD completo**: Crear, ver, editar y eliminar cuentas
- **Saldo inicial**: Configuracion de balance inicial (editable solo sin transacciones)
- **Balance automatico**: Calculo dinamico basado en transacciones
- **Estados**: Activar/desactivar cuentas
- **Vista detallada**: Informacion completa y opciones de edicion

### GESTION DE TARJETAS DE CREDITO
- **CRUD completo**: Gestion completa de tarjetas
- **Limite de credito**: Configuracion y seguimiento de limites
- **Fechas importantes**: Dia de corte y vencimiento con calendario
- **Balance dinamico**: Calculo automatico de deuda y disponible
- **Barra de utilizacion**: Indicador visual del porcentaje usado
- **Dashboard individual**: Vista detallada por tarjeta con metricas
- **Pagos de tarjetas**: Sistema completo de transferencias cuenta-tarjeta

### SISTEMA DE TRANSACCIONES
- **Tipos**: Ingresos y gastos con metodos de pago (efectivo/tarjeta)
- **Formularios inteligentes**: Validacion en tiempo real y campos dinamicos
- **Edicion completa**: Modificar cualquier campo de transacciones existentes
- **Eliminacion segura**: Confirmacion y actualizacion automatica de saldos
- **Calculo automatico**: Actualizacion de saldos al crear/editar/eliminar
- **Sistema de tags**: Etiquetado multiple con creacion instantanea

### SISTEMA DE CATEGORIAS
- **Tipos**: Ingresos y gastos con colores personalizables
- **CRUD completo**: Gestion total de categorias personalizadas
- **Categorias por defecto**: Configuracion automatica inicial
- **Estados**: Activar/desactivar categorias
- **Categoria especial**: "Pago de Tarjeta" para transferencias automaticas

### SISTEMA DE TAGS
- **Etiquetado flexible**: Multiples tags por transaccion
- **Creacion instantanea**: Escribir y presionar Enter/coma
- **Autocompletado**: Sugerencias de tags existentes
- **Colores automaticos**: Asignacion aleatoria de colores
- **Gestion completa**: CRUD de tags con interfaz dedicada

### FILTROS Y BUSQUEDAS
- **Filtros multiples**: Fecha, categoria, tags, metodo de pago
- **Busqueda de texto**: En descripciones de transacciones
- **Botones rapidos**: Periodos predefinidos (hoy, semana, mes, año)
- **Combinacion libre**: Multiples filtros simultaneos
- **URLs persistentes**: Estado de filtros en la URL
- **Interfaz expansible**: Panel de filtros colapsable

### REPORTES Y ANALISIS
- **Graficas interactivas**: Pie charts, bar charts y lineas temporales
- **Metricas avanzadas**: Top categorias de gastos e ingresos
- **Periodos configurables**: Semana, mes, trimestre, año
- **Evolucion temporal**: Tendencias de ingresos y gastos
- **Comparativas**: Analisis periodo a periodo
- **Dashboard de reportes**: Visualizaciones multiples en tiempo real

### CONFIGURACION Y ADMINISTRACION
- **Panel administrativo**: Gestion completa del sistema
- **Ajustes manuales**: Correccion de saldos con historial
- **Recalculo automatico**: Regeneracion de saldos desde transacciones
- **Reset de datos**: Eliminacion segura de transacciones de prueba
- **Edicion de saldo inicial**: Para cuentas y tarjetas sin movimientos
- **Auditoria**: Historial de cambios manuales

---

## SISTEMA DE AUTENTICACION

### Proveedores Configurados
- **Google OAuth**: Autenticacion con cuenta Google
- **Credentials**: Usuario/contraseña para administrador
- **Session Management**: Manejo automatico de sesiones

### Usuario Administrador por Defecto
```
Email: rik@rikmarquez.com
Contraseña: admin123
```

### Caracteristicas de Seguridad
- **Middleware de proteccion**: Todas las rutas protegidas automaticamente
- **Sesiones seguras**: Token-based authentication
- **Redirecciones inteligentes**: Login automatico si ya autenticado

---

## BASE DE DATOS

### Esquema Principal
```sql
-- Usuarios del sistema
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Cuentas de efectivo
cash_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  initial_balance DECIMAL(12,2),
  current_balance DECIMAL(12,2),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tarjetas de credito
credit_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  credit_limit DECIMAL(12,2),
  initial_balance DECIMAL(12,2),
  current_balance DECIMAL(12,2),
  cut_day INTEGER,
  due_day INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Categorias de transacciones
categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  type VARCHAR(20), -- 'income' | 'expense'
  color VARCHAR(7),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Etiquetas (tags)
tags (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP
)

-- Transacciones principales
transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- 'income' | 'expense'
  amount DECIMAL(12,2),
  description TEXT,
  date DATE,
  payment_method VARCHAR(20), -- 'cash' | 'credit_card'
  account_id UUID REFERENCES cash_accounts(id),
  card_id UUID REFERENCES credit_cards(id),
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Relacion transacciones-tags (muchos a muchos)
transaction_tags (
  transaction_id UUID REFERENCES transactions(id),
  tag_id UUID REFERENCES tags(id),
  PRIMARY KEY (transaction_id, tag_id)
)

-- Ajustes manuales de saldos
balance_adjustments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(20), -- 'cash_account' | 'credit_card'
  entity_id UUID,
  previous_balance DECIMAL(12,2),
  new_balance DECIMAL(12,2),
  adjustment_amount DECIMAL(12,2),
  reason TEXT,
  created_at TIMESTAMP
)
```

### Configuracion de Base de Datos
- **Proveedor**: PostgreSQL en Railway
- **ORM**: Drizzle con migraciones automaticas
- **Conexiones**: Pool de conexiones optimizado
- **Indices**: Optimizados para consultas frecuentes

---

## INTERFAZ DE USUARIO

### Diseño Responsivo
- **Mobile First**: Diseño optimizado para moviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Navigation**: Menu hamburguesa en moviles, sidebar en desktop
- **Botones**: Ancho completo en moviles, automatico en desktop

### Tema Visual
- **Framework**: Tailwind CSS con configuracion personalizada
- **Colores principales**:
  - Azul: #3B82F6 (botones primarios)
  - Verde: #10B981 (ingresos)
  - Rojo: #EF4444 (gastos)
  - Purpura: #8B5CF6 (tarjetas)
- **Tipografia**: Sistema de fonts de Tailwind
- **Iconografia**: Lucide React icons

### Componentes UI
- **Button**: Componente base con variantes
- **Forms**: Inputs, selects, textareas estilizados
- **Cards**: Contenedores con sombras y bordes
- **Modals**: Confirmaciones y formularios emergentes
- **Tables**: Listados responsivos con acciones

---

## API DOCUMENTATION

### Base URL
```
Local: http://localhost:3002/api
Production: [URL de Railway]
```

### Endpoints Principales

#### Autenticacion
- `GET /api/auth/session` - Obtener sesion actual
- `POST /api/auth/signin` - Iniciar sesion
- `POST /api/auth/signout` - Cerrar sesion

#### Cuentas de Efectivo
- `GET /api/cash-accounts` - Listar cuentas
- `POST /api/cash-accounts` - Crear cuenta
- `GET /api/cash-accounts/[id]` - Obtener cuenta
- `PUT /api/cash-accounts/[id]` - Actualizar cuenta
- `DELETE /api/cash-accounts/[id]` - Eliminar cuenta
- `PUT /api/cash-accounts/[id]/initial-balance` - Editar saldo inicial

#### Tarjetas de Credito
- `GET /api/credit-cards` - Listar tarjetas
- `POST /api/credit-cards` - Crear tarjeta
- `GET /api/credit-cards/[id]` - Obtener tarjeta
- `PUT /api/credit-cards/[id]` - Actualizar tarjeta
- `DELETE /api/credit-cards/[id]` - Eliminar tarjeta
- `POST /api/credit-cards/[id]/payments` - Procesar pago

#### Transacciones
- `GET /api/transactions` - Listar con filtros
- `POST /api/transactions` - Crear transaccion
- `GET /api/transactions/[id]` - Obtener transaccion
- `PUT /api/transactions/[id]` - Actualizar transaccion
- `DELETE /api/transactions/[id]` - Eliminar transaccion

#### Categorias y Tags
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Crear categoria
- `PUT /api/categories/[id]` - Actualizar categoria
- `GET /api/tags` - Listar tags
- `POST /api/tags` - Crear tag

#### Administracion
- `POST /api/admin/recalculate-balances` - Recalcular saldos
- `POST /api/admin/reset-data` - Reset transacciones
- `GET /api/balance-adjustments` - Historial ajustes

### Formato de Respuestas
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional"
}

// En caso de error
{
  "success": false,
  "error": "Mensaje de error detallado"
}
```

---

## DESPLIEGUE Y PRODUCCION

### Configuracion de Railway
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+

### Variables de Entorno Requeridas
```bash
# Base de datos
DATABASE_URL=postgresql://...

# NextAuth.js
NEXTAUTH_URL=https://tu-dominio.railway.app
NEXTAUTH_SECRET=tu-secret-muy-seguro

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### Proceso de Despliegue
1. **Push a main**: Railway detecta cambios automaticamente
2. **Build automatico**: Compilacion de Next.js
3. **Migraciones**: Drizzle ejecuta migraciones pendientes
4. **Deploy**: Aplicacion disponible en URL de Railway

---

## CARACTERISTICAS MOBILE

### Navegacion Movil
- **Menu hamburguesa**: Icono en header para abrir/cerrar sidebar
- **Overlay backdrop**: Fondo semitransparente al abrir menu
- **Auto-close**: Cierre automatico al navegar
- **Touch gestures**: Swipe para cerrar menu

### Layouts Responsivos
- **Transacciones**: Botones apilados verticalmente en movil
- **Formularios**: Campos de ancho completo en pantallas pequeñas
- **Tablas**: Scroll horizontal en moviles
- **Cards**: Adaptacion automatica de contenido

### Optimizaciones
- **Loading states**: Indicadores de carga en todas las operaciones
- **Touch targets**: Botones con tamaño minimo 44px
- **Typography**: Tamaños legibles en todas las resoluciones

---

## TESTING Y CALIDAD

### Validaciones
- **Frontend**: Validacion en tiempo real con React
- **Backend**: Esquemas Zod para validacion de APIs
- **Base de datos**: Constraints y foreign keys

### Manejo de Errores
- **Try/catch**: Captura de errores en todas las operaciones
- **User feedback**: Mensajes claros para el usuario
- **Logging**: Console.log para debugging en desarrollo

### Performance
- **Static Generation**: Paginas estaticas donde es posible
- **API caching**: Respuestas optimizadas
- **Database indexing**: Indices en campos consultados frecuentemente

---

## METRICAS Y ANALYTICS

### Funcionalidades de Seguimiento
- **Balance total**: Suma de todas las cuentas activas
- **Gastos mensuales**: Agregacion por periodo
- **Top categorias**: Ranking de gastos por categoria
- **Evolucion temporal**: Tendencias de ingresos y gastos
- **Utilizacion de tarjetas**: Porcentaje usado del limite

### Reportes Disponibles
- **Dashboard financiero**: Resumen ejecutivo
- **Graficas por categoria**: Distribucion de gastos/ingresos
- **Evolucion temporal**: Tendencias mensuales/anuales
- **Comparativas**: Periodo actual vs anterior

---

## MANTENIMIENTO Y SOPORTE

### Administracion del Sistema
- **Reset de datos**: Para eliminar transacciones de prueba
- **Recalculo de saldos**: Correccion de inconsistencias
- **Ajustes manuales**: Correccion de errores con auditoria
- **Gestion de usuarios**: Panel administrativo basico

### Backup y Recuperacion
- **Railway backups**: Backups automaticos de base de datos
- **Migraciones**: Control de versiones del esquema
- **Data export**: APIs para exportar datos del usuario

---

## LICENCIA Y TERMINOS

**Proyecto**: Balanz - Aplicacion de gestion financiera personal  
**Desarrollador**: Claude AI + Rik Marquez  
**Tipo**: Aplicacion privada para uso personal  
**Fecha de finalizacion**: 18 de Agosto 2025  
**Estado**: COMPLETADO AL 100% - Produccion Ready  

---

## INFORMACION DE CONTACTO

**Desarrollador Principal**: Rik Marquez  
**Email**: rik@rikmarquez.com  
**GitHub**: https://github.com/rikmarquez/balanz  

**Asistente de Desarrollo**: Claude AI (Anthropic)  
**Generado con**: [Claude Code](https://claude.ai/code)  

---

*Este documento describe una aplicacion completamente funcional lista para uso en produccion.*  
*Ultima actualizacion: 18 de Agosto 2025*