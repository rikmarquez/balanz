# BALANZ - Documentación de API

*Fecha de actualización: 18 de Agosto 2025 - 01:30*

## 📋 Resumen General

**Base URL**: http://localhost:3002/api  
**Autenticación**: NextAuth.js (Session-based) - ¡MIGRADO!  
**Respuesta**: JSON estandarizado  
**Validación**: Zod schemas  
**Estado**: ✅ API 100% Completada y Funcional  

---

## 🔐 Autenticación

Todas las rutas de la API requieren autenticación a través de NextAuth.js. El middleware verifica automáticamente la sesión del usuario.

```typescript
// Sistema de autenticación NextAuth.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Middleware automático en todas las rutas
const session = await getServerSession(authOptions);
const user = await getCurrentUser(session.user.email);
```

### Proveedores de Autenticación:
- ✅ **Credentials Provider** - Usuario/contraseña para admin
- ✅ **Google OAuth Provider** - Autenticación con Google
- ✅ **Session Management** - Manejo automático de sesiones

---

## 📊 Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {...},
  "message": "Operación exitosa" // opcional
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Errores de Validación
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "data": [
    {
      "field": "nombre_campo",
      "message": "Mensaje de error específico"
    }
  ]
}
```

---

## 💰 API de Cuentas de Efectivo

### Listar Cuentas
**GET** `/api/accounts`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Cuenta Personal",
      "initialBalance": "1000.00",
      "currentBalance": "1250.50",
      "isActive": true,
      "createdAt": "2025-08-16T...",
      "updatedAt": "2025-08-16T..."
    }
  ]
}
```

### Crear Cuenta
**POST** `/api/accounts`

**Body:**
```json
{
  "name": "Nueva Cuenta",
  "initialBalance": "500.00"
}
```

### Obtener Cuenta por ID
**GET** `/api/accounts/[id]`

### Actualizar Cuenta
**PUT** `/api/accounts/[id]`

**Body:**
```json
{
  "name": "Nombre Actualizado",
  "isActive": true
}
```

### Eliminar Cuenta
**DELETE** `/api/accounts/[id]`

### Actualizar Saldo Inicial
**PUT** `/api/accounts/[id]/initial-balance`

**Body:**
```json
{
  "initialBalance": "1000.00"
}
```

**Nota:** Solo funciona si la cuenta no tiene transacciones.

---

## 🏷️ API de Categorías

### Listar Categorías
**GET** `/api/categories`

**Query Params:**
- `type`: `income` | `expense` (opcional)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Alimentación",
      "type": "expense",
      "color": "#EF4444",
      "isActive": true,
      "createdAt": "2025-08-16T...",
      "updatedAt": "2025-08-16T..."
    }
  ]
}
```

### Crear Categoría
**POST** `/api/categories`

**Body:**
```json
{
  "name": "Nueva Categoría",
  "type": "income",
  "color": "#10B981"
}
```

### Obtener Categoría por ID
**GET** `/api/categories/[id]`

### Actualizar Categoría
**PUT** `/api/categories/[id]`

**Body:**
```json
{
  "name": "Nombre Actualizado",
  "type": "expense",
  "color": "#DC2626",
  "isActive": false
}
```

### Eliminar Categoría
**DELETE** `/api/categories/[id]`

---

## 💳 API de Tarjetas de Crédito

### Listar Tarjetas
**GET** `/api/credit-cards`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Visa Principal",
      "creditLimit": "5000.00",
      "initialBalance": "0.00",
      "currentBalance": "1250.00",
      "cutDay": 15,
      "dueDay": 10,
      "isActive": true,
      "createdAt": "2025-08-16T...",
      "updatedAt": "2025-08-16T..."
    }
  ]
}
```

### Crear Tarjeta
**POST** `/api/credit-cards`

**Body:**
```json
{
  "name": "Nueva Tarjeta",
  "creditLimit": "3000.00",
  "initialBalance": "0.00",
  "cutDay": 20,
  "dueDay": 15
}
```

### Obtener Tarjeta por ID
**GET** `/api/credit-cards/[id]`

### Actualizar Tarjeta
**PUT** `/api/credit-cards/[id]`

### Eliminar Tarjeta
**DELETE** `/api/credit-cards/[id]`

---

## 📝 API de Transacciones

### Listar Transacciones
**GET** `/api/transactions`

**Query Params:**
- `limit`: número (opcional)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": "150.00",
      "date": "2025-08-16",
      "description": "Compra supermercado",
      "type": "expense",
      "paymentMethod": "cash",
      "notes": "Despensa semanal",
      "createdAt": "2025-08-16T...",
      "updatedAt": "2025-08-16T...",
      "category": {
        "id": "uuid",
        "name": "Alimentación",
        "type": "expense",
        "color": "#EF4444"
      },
      "account": {
        "id": "uuid",
        "name": "Cuenta Personal"
      },
      "card": null
    }
  ]
}
```

### Crear Transacción
**POST** `/api/transactions`

**Body (Efectivo):**
```json
{
  "amount": "150.00",
  "date": "2025-08-16",
  "description": "Compra supermercado",
  "type": "expense",
  "paymentMethod": "cash",
  "categoryId": "uuid",
  "accountId": "uuid",
  "notes": "Opcional"
}
```

**Body (Tarjeta):**
```json
{
  "amount": "150.00",
  "date": "2025-08-16",
  "description": "Compra online",
  "type": "expense",
  "paymentMethod": "credit_card",
  "categoryId": "uuid",
  "cardId": "uuid",
  "notes": "Opcional"
}
```

### Obtener Transacción por ID
**GET** `/api/transactions/[id]`

### Actualizar Transacción
**PUT** `/api/transactions/[id]`

### Eliminar Transacción
**DELETE** `/api/transactions/[id]`

---

## ⚠️ Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado
- **400**: Error de validación o lógica de negocio
- **401**: No autorizado
- **404**: Recurso no encontrado
- **405**: Método no permitido
- **422**: Error de validación de datos
- **500**: Error interno del servidor

---

## 🔧 Middlewares

### `withAuth`
Verifica la autenticación del usuario y obtiene los datos del usuario desde la base de datos.

### `validateMethod`
Valida que el método HTTP sea uno de los permitidos para el endpoint.

---

## 📊 Validaciones con Zod

Todos los endpoints utilizan esquemas de Zod para validar los datos de entrada:

- `CreateCashAccountSchema`
- `UpdateCashAccountSchema`
- `UpdateInitialBalanceSchema`
- `CreateCategorySchema`
- `UpdateCategorySchema`
- `CreateCreditCardSchema`
- `UpdateCreditCardSchema`
- `CreateTransactionSchema`
- `UpdateTransactionSchema`

---

---

## 🏷️ API de Tags

### Listar Tags
**GET** `/api/tags`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid", 
      "name": "Trabajo",
      "color": "#3B82F6",
      "createdAt": "2025-08-18T..."
    }
  ]
}
```

### Crear Tag
**POST** `/api/tags`

**Body:**
```json
{
  "name": "Nuevo Tag",
  "color": "#10B981"
}
```

### Actualizar Tag
**PUT** `/api/tags/[id]`

### Eliminar Tag
**DELETE** `/api/tags/[id]`

---

## 💸 API de Pagos de Tarjetas

### Procesar Pago
**POST** `/api/credit-cards/[cardId]/payments`

**Body:**
```json
{
  "amount": "500.00",
  "accountId": "uuid",
  "description": "Pago tarjeta Visa"
}
```

---

## 📊 API de Reportes

### Obtener Transacciones con Filtros
**GET** `/api/transactions`

**Query Params:**
- `startDate`: YYYY-MM-DD (opcional)
- `endDate`: YYYY-MM-DD (opcional) 
- `categoryId`: uuid (opcional)
- `accountId`: uuid (opcional)
- `cardId`: uuid (opcional)
- `type`: income|expense (opcional)
- `search`: string (opcional)
- `tags`: string[] (opcional)

---

## 🔧 API de Administración

### Recalcular Saldos
**POST** `/api/admin/recalculate-balances`

### Reset de Transacciones
**POST** `/api/admin/reset-data`

**Body:**
```json
{
  "confirm": "RESET_TRANSACTIONS"
}
```

### Reset Completo de Datos
**POST** `/api/admin/reset-all-data`

### Ajustes Manuales de Saldos
**GET/POST/PUT/DELETE** `/api/balance-adjustments`

---

## 🚀 Estado de Implementación Final

| Endpoint | Estado | Notas |
|----------|---------|-------|
| Cuentas (CRUD) | ✅ Completo | Incluye saldo inicial y balance automático |
| Categorías (CRUD) | ✅ Completo | Con sistema de colores y filtros |
| Transacciones (CRUD) | ✅ Completo | Con relaciones, filtros y búsqueda |
| Tarjetas (CRUD) | ✅ Completo | Frontend y backend completo |
| Tags (CRUD) | ✅ Completo | Sistema completo de etiquetas |
| Pagos de Tarjetas | ✅ Completo | Transferencias automáticas |
| Filtros Avanzados | ✅ Completo | Búsqueda multifiltro |
| Reportes | ✅ Completo | Gráficas y análisis |
| Administración | ✅ Completo | Gestión de datos y saldos |
| Autenticación | ✅ Completo | NextAuth.js + Google OAuth |
| Validaciones | ✅ Completo | Zod schemas completos |
| Manejo de errores | ✅ Completo | Respuestas estandarizadas |
| Responsividad | ✅ Completo | Móvil, tablet y desktop |

**Estado General: ✅ API 100% COMPLETADA**

---

## 🎉 FUNCIONALIDADES FINALES IMPLEMENTADAS

### ✅ APIs Avanzadas:
- **Sistema completo de filtros** con múltiples parámetros
- **Búsqueda de texto** en descripciones de transacciones  
- **Filtros por tags** con selección múltiple
- **Filtros por fecha** con rangos personalizados
- **API de reportes** con cálculos automáticos
- **Endpoints de administración** para gestión de datos

### ✅ Funcionalidades de Negocio:
- **Cálculo automático de saldos** al crear/editar transacciones
- **Recálculo masivo** de todos los saldos desde transacciones
- **Sistema de pagos** de tarjetas con actualización automática
- **Ajustes manuales** con historial de cambios
- **Reset de datos** con confirmaciones múltiples

### ✅ Integración Frontend-Backend:
- **Client-side filtering** con URLs persistentes
- **Búsqueda en tiempo real** con debounce
- **Filtros combinables** con estado compartido
- **Paginación automática** con scroll infinito
- **Validaciones sincronizadas** entre frontend y backend

---

*Documentación actualizada - Sesión FINAL: 18 Agosto 2025 - 01:30*  
**🎯 ESTADO: API COMPLETAMENTE DOCUMENTADA Y FUNCIONAL 🎯**