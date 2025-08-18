# 🚀 Guía de Despliegue en Railway - Balanz

## ✅ Estado Actual
- **Migración NextAuth.js**: ✅ Completada
- **Build de Producción**: ✅ Exitoso
- **Base de Datos**: ✅ PostgreSQL funcionando en Railway
- **Migración de Datos**: ✅ Completada (usuario por defecto creado)

## 📋 Variables de Entorno para Railway

### 1. Eliminar Variables de Clerk (Railway Dashboard)
```bash
# Eliminar estas variables de Railway:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```

### 2. Configurar Variables de NextAuth

#### 2.1 Crear Aplicación OAuth en Google Cloud Console
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0:
   - **Authorized JavaScript origins**: `https://balanz-production.up.railway.app`
   - **Authorized redirect URIs**: `https://balanz-production.up.railway.app/api/auth/callback/google`

#### 2.2 Configurar Variables en Railway Dashboard
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://balanz-production.up.railway.app
NEXTAUTH_SECRET=generate-random-32-character-secret-here

# Google OAuth Credentials (desde Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Database (mantener existente)
DATABASE_URL=postgresql://postgres:myZKEVDbnppIZINvbSEyWWlPRsKQgeDH@trolley.proxy.rlwy.net:31671/balanz

# Railway Configuration
PORT=3000
NODE_ENV=production
```

#### 2.3 Generar NEXTAUTH_SECRET
```bash
# Ejecutar en terminal para generar secreto aleatorio:
openssl rand -base64 32
```

## 🔧 Pasos para Deployment

### 1. Configurar Variables en Railway
- Ir al Dashboard de Railway
- Seleccionar el proyecto Balanz
- Ir a Variables tab
- Eliminar todas las variables de Clerk
- Agregar las nuevas variables de NextAuth

### 2. Configurar Google OAuth
- Crear aplicación OAuth en Google Cloud Console
- Copiar Client ID y Client Secret a Railway
- Configurar URLs de callback correctas

### 3. Deploy
- Railway detectará automáticamente los cambios
- O hacer push manual al repositorio conectado
- Railway ejecutará `npm run railway:build`

### 4. Verificar Deployment
- Abrir `https://balanz-production.up.railway.app`
- Probar login con Google OAuth
- Verificar que todas las funcionalidades trabajen

## 🎯 URLs Importantes

- **Aplicación**: https://balanz-production.up.railway.app
- **Login**: https://balanz-production.up.railway.app/auth/signin
- **Dashboard**: https://balanz-production.up.railway.app/dashboard
- **OAuth Callback**: https://balanz-production.up.railway.app/api/auth/callback/google

## 🔐 Notas de Seguridad

1. **NEXTAUTH_SECRET**: Debe ser un string aleatorio de al menos 32 caracteres
2. **Google OAuth**: Configurar correctamente las URLs autorizadas
3. **Database**: URL ya está configurada y funcionando
4. **Dominio**: Configurar CSP si es necesario

## 👤 Usuario Administrador

La migración creó el usuario administrador específico:
- **Email**: rik@rikmarquez.com
- **Nombre**: Rik Marquez
- **Propósito**: Todos los datos existentes están asociados a este usuario
- **Login**: Puede usar credenciales específicas o Google OAuth
- **Datos**: Todas las cuentas, tarjetas y transacciones están vinculadas a este usuario

## 🚨 Troubleshooting

### Error 401 en APIs
- Verificar que NEXTAUTH_SECRET esté configurado
- Verificar que Google OAuth esté configurado correctamente

### Error de Login
- Verificar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
- Verificar URLs autorizadas en Google Cloud Console

### Error de Base de Datos
- DATABASE_URL debe mantenerse sin cambios
- La base de datos ya está funcionando en Railway

## ✅ Checklist Final

- [ ] Variables de Clerk eliminadas de Railway
- [ ] Google OAuth app creada en Google Cloud Console
- [ ] Variables de NextAuth configuradas en Railway
- [ ] NEXTAUTH_SECRET generado y configurado
- [ ] URLs de callback configuradas en Google
- [ ] Deployment iniciado en Railway
- [ ] Login probado exitosamente
- [ ] Funcionalidades principales verificadas

---

## 🎯 Métodos de Autenticación Disponibles

### 1. Credenciales Específicas (Administrador)
- **Email**: rik@rikmarquez.com  
- **Password**: (credenciales configuradas)
- **Acceso**: Inmediato a todos los datos existentes

### 2. Google OAuth
- **Configuración**: Requiere Google Cloud Console
- **Nuevos usuarios**: Tendrán sus propios datos separados
- **Administrador**: Puede también usar este método

---

**Estado**: ✅ Listo para deployment en producción
**Sistema de Auth**: ✅ Credenciales + Google OAuth configurado
**Migración de datos**: ✅ Completada con usuario específico
**Última actualización**: 18 Agosto 2025 - 00:45