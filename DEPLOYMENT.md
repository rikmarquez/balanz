# 🚀 Guía de Despliegue en Railway - Balanz

*Actualizado: 17 de Agosto 2025*

## 📋 Estrategia de Despliegue

**Configuración**: Monolito Full-Stack con Next.js Standalone
**Plataforma**: Railway
**Base de Datos**: PostgreSQL externa (ya existente en tu Railway)
**Build**: Código precompilado para mejor rendimiento

---

## ⚙️ Configuraciones Automáticas (Ya implementadas)

### ✅ 1. Next.js Optimizado (`next.config.mjs`)
```javascript
// Configuración standalone para Railway
output: 'standalone',
poweredByHeader: false,
generateEtags: false,
images: { unoptimized: true }
```

### ✅ 2. Railway Configuration (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
buildCommand = "npm ci && npm run db:push && npm run build"
startCommand = "node .next/standalone/server.js"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"
```

---

## 🔧 CONFIGURACIONES MANUALES QUE DEBES HACER

### 📍 PASO 1: Conectar Repositorio
1. **En Railway Dashboard**:
   - Ve a tu proyecto "Balanz"
   - Click en "Deploy from GitHub repo"
   - Selecciona tu repositorio de GitHub
   - Branch: `main`

### 📍 PASO 2: Variables de Entorno
**EN RAILWAY - Settings > Environment Variables**, agregar:

```bash
# Base de Datos (TU BASE DE DATOS EXTERNA)
DATABASE_URL=postgresql://username:password@host:port/database

# Clerk Authentication (TUS KEYS DE CLERK)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Railway Configuration
NODE_ENV=production
PORT=3000
```

### 📍 PASO 3: Configurar Dominio (Opcional)
1. **En Railway**:
   - Settings > Networking
   - Agregar dominio personalizado si lo tienes
   - O usar el dominio generado por Railway

---

## 🔗 URLs de Conexión

### Base de Datos Externa
**¿Cómo obtener tu DATABASE_URL?**

1. Ve a tu servicio de PostgreSQL en Railway
2. En la pestaña "Connect"
3. Copia la "Postgres Connection URL"
4. Formato: `postgresql://postgres:password@host:port/railway`

### Clerk Authentication
**¿Cómo configurar para producción?**

1. En [Clerk Dashboard](https://dashboard.clerk.com)
2. Ve a tu aplicación
3. **IMPORTANTE**: Agregar el dominio de Railway en:
   - Settings > Domains
   - Authorized domains
4. Cambiar keys de `test` a `live` en variables de entorno

---

## 🚀 Proceso de Despliegue

### Despliegue Automático
```bash
# Al hacer push a main:
git add .
git commit -m "Deploy to Railway"
git push origin main

# Railway automáticamente:
# 1. npm ci (instala dependencias)
# 2. npm run db:push (sincroniza BD)
# 3. npm run build (genera .next/standalone)
# 4. node .next/standalone/server.js (inicia servidor)
```

### Verificación Post-Despliegue
1. **Build Logs**: Revisar que no haya errores
2. **Database**: Verificar conexión en logs
3. **Authentication**: Probar login/registro
4. **APIs**: Verificar endpoints en `/api/*`

### 3. Características de Producción

✅ **Auto-migraciones**: Las migraciones de BD se ejecutan automáticamente  
✅ **Inicialización de usuarios**: Datos por defecto para nuevos usuarios  
✅ **Optimización de build**: Código compilado y optimizado  
✅ **Variables de entorno**: Configuración segura para producción  
✅ **HTTPS**: SSL automático con Railway  

### 4. Monitoreo Post-Despliegue

- Verificar logs de Railway para errores
- Probar autenticación con Clerk
- Confirmar funcionalidad de BD
- Validar todas las funcionalidades principales

### 5. Funcionalidades Incluidas

🎯 **Sistema completo de gestión financiera personal**

- ✅ Autenticación segura con Clerk
- ✅ Gestión de cuentas de efectivo
- ✅ Gestión de tarjetas de crédito
- ✅ Registro de transacciones (ingresos/gastos)
- ✅ Sistema de categorías personalizable
- ✅ Sistema de tags para organización
- ✅ Pagos entre cuentas y tarjetas
- ✅ Cálculo automático de saldos
- ✅ Filtros avanzados y búsquedas
- ✅ Reportes y gráficas interactivas
- ✅ Configuración y ajustes manuales
- ✅ Historial de cambios y auditoría

### 6. Arquitectura Técnica

- **Frontend**: Next.js 14 con React Server Components
- **Backend**: API Routes integradas en Next.js
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Autenticación**: Clerk con OAuth
- **Estilos**: Tailwind CSS
- **Gráficas**: Recharts
- **Hosting**: Railway con auto-despliegue

---

**Proyecto listo para producción** 🚀