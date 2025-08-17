# BALANZ - Documentación de API

*Fecha de actualización: 16 de Agosto 2025 - 16:05*

## 📋 Resumen General

**Base URL**: http://localhost:3002/api  
**Autenticación**: Clerk (Bearer Token)  
**Respuesta**: JSON estandarizado  
**Validación**: Zod schemas  

---

## 🔐 Autenticación

Todas las rutas de la API requieren autenticación a través de Clerk. El middleware `withAuth` verifica automáticamente el token de usuario.

```typescript
// Middleware automático en todas las rutas
const { userId } = auth();
const user = await getCurrentUser();
```

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

## 🚀 Estado de Implementación

| Endpoint | Estado | Notas |
|----------|---------|-------|
| Cuentas (CRUD) | ✅ Completo | Incluye saldo inicial |
| Categorías (CRUD) | ✅ Completo | Con sistema de colores |
| Transacciones (CRUD) | ✅ Completo | Con relaciones completas |
| Tarjetas (CRUD) | ✅ Backend listo | Frontend pendiente |
| Autenticación | ✅ Completo | Clerk + middleware |
| Validaciones | ✅ Completo | Zod schemas |
| Manejo de errores | ✅ Completo | Respuestas estandarizadas |

---

*Documentación actualizada automáticamente con cada nueva funcionalidad implementada*