# BALANZ - Arquitectura API Frontend/Backend

*Fecha de actualización: 16 de Agosto 2025 - 23:30*

## 🏗️ Arquitectura General

**Balanz** está implementado como un **monolito full-stack** con Next.js 14, donde el frontend y backend están en el mismo proyecto pero claramente separados:

```
BALANZ PROJECT
├── FRONTEND (React Components)
│   ├── Pages (/src/app/*)
│   ├── Components (/src/components/*)
│   └── Client-side Logic
├── BACKEND (API Routes)
│   ├── REST API (/src/app/api/*)
│   ├── Database Services (/src/lib/services/*)
│   └── Business Logic
└── SHARED
    ├── Types (/src/types/*)
    ├── Utils (/src/lib/utils.ts)
    └── Database Schema (/src/lib/db/*)
```

---

## 🔌 API REST - Endpoints Implementados

### Base URL
```
Development: http://localhost:3002/api ✅ FUNCIONANDO
Production: https://balanz.railway.app/api (por configurar)
```

### 🔐 **Authentication**
```http
GET /api/auth/user ✅ FUNCIONANDO
```
- **Descripción**: Obtiene información del usuario autenticado
- **Auth**: ✅ Requerida (Clerk) - PROBADO
- **Response**: `{ id, email, name, clerkId, createdAt }`
- **Estado**: ✅ Completamente funcional

---

### 💰 **Cash Accounts**

#### Listar/Crear Cuentas
```http
GET  /api/accounts ✅ FUNCIONANDO
POST /api/accounts ✅ FUNCIONANDO
```

**GET** - Obtener todas las cuentas del usuario:
- **Auth**: ✅ Requerida - PROBADO
- **Response**: `Array<CashAccount>`
- **Estado**: ✅ Completamente funcional

**POST** - Crear nueva cuenta:
- **Auth**: ✅ Requerida - PROBADO
- **Body**: `{ name: string, initialBalance: string }`
- **Validation**: Zod schema ✅ FUNCIONANDO
- **Response**: `CashAccount`
- **Estado**: ✅ Completamente funcional

#### Operaciones Individuales
```http
GET    /api/accounts/[id] ✅ FUNCIONANDO
PUT    /api/accounts/[id] ✅ FUNCIONANDO
DELETE /api/accounts/[id] ✅ FUNCIONANDO
```

**GET** - Obtener cuenta específica:
- **Auth**: ✅ Requerida - PROBADO
- **Response**: `CashAccount | 404`
- **Estado**: ✅ Completamente funcional

**PUT** - Actualizar cuenta:
- **Auth**: ✅ Requerida - PROBADO
- **Body**: `{ name: string, isActive?: boolean }`
- **Response**: `CashAccount | 404`
- **Estado**: ✅ Completamente funcional

**DELETE** - Eliminar cuenta:
- **Auth**: ✅ Requerida - PROBADO
- **Response**: `{ success: true } | 404`
- **Estado**: ✅ Completamente funcional

---

## 🔴 API REST - Endpoints Pendientes

### 💳 **Credit Cards**
```http
GET    /api/cards
POST   /api/cards
GET    /api/cards/[id]
PUT    /api/cards/[id]
DELETE /api/cards/[id]

# Pagos de tarjetas
GET    /api/cards/[id]/payments
POST   /api/cards/[id]/payments

# Ajustes de saldo
POST   /api/cards/[id]/adjust
```

### 🏷️ **Categories**
```http
GET    /api/categories
POST   /api/categories
GET    /api/categories/[id]
PUT    /api/categories/[id]
DELETE /api/categories/[id]
```

### 📝 **Transactions**
```http
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/[id]
PUT    /api/transactions/[id]
DELETE /api/transactions/[id]

# Búsqueda avanzada
POST   /api/transactions/search
```

### 🏷️ **Tags**
```http
GET    /api/tags
POST   /api/tags
GET    /api/tags/[id]
PUT    /api/tags/[id]
DELETE /api/tags/[id]
```

### 📊 **Reports**
```http
GET /api/reports/summary
GET /api/reports/categories
GET /api/reports/trends
```

### ⚙️ **Adjustments**
```http
GET  /api/adjustments
POST /api/adjustments
GET  /api/adjustments/[id]
```

---

## 🛡️ Middleware y Seguridad

### Middleware de Autenticación
```typescript
// /src/lib/api/middleware.ts
export async function withAuth<T>(
  request: NextRequest,
  handler: (user: any) => Promise<T>
): Promise<T>
```

**Funcionalidades**:
- ✅ Validación de token Clerk
- ✅ Obtención automática del usuario
- ✅ Manejo de errores de autenticación
- ✅ Tipado fuerte con TypeScript

### Validación de Métodos HTTP
```typescript
export function validateMethod(
  request: NextRequest, 
  allowedMethods: string[]
)
```

### Respuestas Estandarizadas
```typescript
// /src/lib/api/response.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Tipos de respuesta**:
- `successResponse(data, message?)`
- `errorResponse(error, status?)`
- `validationErrorResponse(zodError)`
- `unauthorizedResponse()`
- `notFoundResponse(resource?)`
- `serverErrorResponse(error?)`

---

## 📡 Cliente API (Frontend)

### API Client
```typescript
// /src/lib/api/client.ts
class ApiClient {
  async getCashAccounts()
  async createCashAccount(data)
  async updateCashAccount(id, data)
  async deleteCashAccount(id)
  // ... más métodos
}

export const apiClient = new ApiClient();
```

**Características**:
- ✅ Manejo automático de errores
- ✅ Tipado fuerte con TypeScript  
- ✅ Headers automáticos (Content-Type)
- ✅ Base URL configurable por entorno
- 🔴 Interceptors (por implementar)
- 🔴 Retry automático (por implementar)
- 🔴 Cache (por implementar)

### Uso en Componentes
```typescript
// Ejemplo de uso en componente React
import { apiClient } from '@/lib/api/client';

export function CashAccountsList() {
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    apiClient.getCashAccounts()
      .then(setAccounts)
      .catch(console.error);
  }, []);
  
  const handleCreate = async (data) => {
    try {
      const newAccount = await apiClient.createCashAccount(data);
      setAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
}
```

---

## 🔧 Configuración y Variables de Entorno

### Variables Requeridas
```env
# Base de datos
DATABASE_URL=postgresql://...

# Autenticación Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# URLs (opcional para desarrollo)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Configuración Next.js
```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["postgres"]
  },
  // Configuración adicional para API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};
```

---

## 📊 Flujo de Datos

### 1. **Server Components (SSR)**
```typescript
// /src/app/dashboard/accounts/page.tsx
export default async function AccountsPage() {
  const user = await requireAuth();
  const accounts = await getCashAccounts(user.id);
  
  return <CashAccountsList accounts={accounts} />;
}
```
- ✅ Renderizado en servidor
- ✅ SEO optimizado
- ✅ Datos iniciales rápidos

### 2. **Client Components (CSR)**
```typescript
// /src/components/cash-accounts/CreateAccountForm.tsx
'use client';

export function CreateAccountForm() {
  const handleSubmit = async (data) => {
    const result = await apiClient.createCashAccount(data);
    // Actualizar estado local
  };
}
```
- ✅ Interactividad completa
- ✅ Actualizaciones en tiempo real
- ✅ Optimistic updates

### 3. **Hybrid Approach (Recomendado)**
```typescript
// Combinar ambos enfoques:
// - Server Components para datos iniciales
// - Client Components para interactividad
// - API calls para actualizaciones
```

---

## 🚀 Despliegue en Railway

### Configuración de Build
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

### Variables de Entorno en Railway
```bash
# Automáticamente configuradas por Railway
DATABASE_URL=postgresql://...

# Manuales (por configurar)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXTAUTH_URL=https://balanz.railway.app
```

### Configuración Railway
```toml
# railway.toml (opcional)
[build]
  builder = "nixpacks"
  
[deploy]
  startCommand = "npm start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10
```

---

## 🔄 Patrón de Arquitectura

### Separación de Responsabilidades

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                       │
├─────────────────────────────────────────────────┤
│ • React Components (UI)                         │
│ • Client-side State Management                  │
│ • Form Handling & Validation                    │
│ • User Interactions                             │
└─────────────────────────────────────────────────┘
                          │
                    HTTP Requests
                          │
┌─────────────────────────────────────────────────┐
│                 API LAYER                       │
├─────────────────────────────────────────────────┤
│ • Route Handlers (/api/*)                       │
│ • Request/Response Processing                    │
│ • Authentication Middleware                     │
│ • Error Handling                                │
└─────────────────────────────────────────────────┘
                          │
                    Function Calls
                          │
┌─────────────────────────────────────────────────┐
│               BUSINESS LOGIC                    │
├─────────────────────────────────────────────────┤
│ • Services Layer (/lib/services/*)              │
│ • Data Validation (Zod)                         │
│ • Business Rules                                │
│ • Data Transformations                          │
└─────────────────────────────────────────────────┘
                          │
                    ORM Queries
                          │
┌─────────────────────────────────────────────────┐
│                 DATABASE                        │
├─────────────────────────────────────────────────┤
│ • PostgreSQL (Railway)                          │
│ • Drizzle ORM                                   │
│ • Schema & Migrations                           │
│ • Relationships & Constraints                   │
└─────────────────────────────────────────────────┘
```

---

## 📈 Beneficios de esta Arquitectura

### ✅ **Ventajas del Monolito Full-Stack**
1. **Desarrollo Simplificado**: Un solo repositorio, un solo deploy
2. **Tipo Safety**: Compartir tipos entre frontend y backend
3. **Performance**: Renderizado en servidor + hidratación client
4. **SEO Optimizado**: Server-side rendering nativo
5. **Caching Inteligente**: Next.js cache automático
6. **Hot Reload**: Desarrollo rápido con recarga automática

### ✅ **Separación Clara de Responsabilidades**
1. **Frontend**: Solo UI y experiencia de usuario
2. **API**: Solo lógica de endpoints y validación
3. **Services**: Solo lógica de negocio y datos
4. **Database**: Solo persistencia y consultas

### ✅ **Escalabilidad Futura**
1. **Microservicios**: Fácil extracción de servicios específicos
2. **API Externa**: Endpoints listos para consumo externo
3. **Mobile Apps**: API disponible para apps móviles
4. **Integraciones**: Webhooks y APIs de terceros

---

## 🎯 Próximos Pasos

### Inmediatos
1. **Completar API de Tarjetas de Crédito**
2. **Implementar API de Categorías**
3. **Crear API de Transacciones**
4. **Añadir manejo de errores avanzado**

### Mediano Plazo
1. **Implementar caché en API Client**
2. **Añadir interceptors y retry logic**
3. **Optimistic updates en UI**
4. **Real-time updates con WebSockets**

### Largo Plazo
1. **API rate limiting**
2. **Documentación automática (Swagger)**
3. **Monitoring y observabilidad**
4. **Performance optimization**

---

*Esta arquitectura permite desarrollar rápidamente mientras mantiene la flexibilidad para escalar en el futuro.*