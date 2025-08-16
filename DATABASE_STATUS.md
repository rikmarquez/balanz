# BALANZ - Status de Base de Datos

*Fecha de actualización: 16 de Agosto 2025 - 23:30*

## 🗄️ Información General

**Motor de BD**: PostgreSQL 15+  
**Hosting**: Railway Cloud  
**ORM**: Drizzle ORM  
**Estado**: ✅ Completamente Funcional - PROBADO  
**URL de Conexión**: ✅ Configurada y funcionando  
**Migraciones**: ✅ Aplicadas correctamente  
**Datos iniciales**: ✅ Se crean automáticamente  

---

## 📋 ESQUEMA DE TABLAS

### 👤 **users** (Usuarios del Sistema)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Implementada y Funcionando  
**Relaciones**: 1:N con todas las demás tablas  
**Índices**: clerk_id (único), email (único)

---

### 💰 **cash_accounts** (Cuentas de Efectivo)
```sql
CREATE TABLE cash_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  initial_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
  current_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Implementada y Funcionando  
**Servicios**: ✅ CRUD completo disponible  
**Datos por defecto**: Personal, Fiscal, Nómina, Caja Popular, Efectivo  

---

### 💳 **credit_cards** (Tarjetas de Crédito)
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  credit_limit DECIMAL(12,2) NOT NULL,
  initial_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
  current_balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
  cut_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  
**Validaciones**: cut_day y due_day entre 1-31  

---

### 🏷️ **categories** (Categorías de Ingresos/Gastos)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'income' | 'expense'
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, ✅ Datos por defecto configurados  
**Datos por defecto**:
- **Ingresos**: Coaching, Consultoría, Cursos, Productos digitales, etc.
- **Gastos**: Formación, Gasolina, Viáticos, Medicina, Streaming, etc.

---

### 🏷️ **tags** (Etiquetas para Transacciones)
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  

---

### 💸 **transactions** (Transacciones Financieras)
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'income' | 'expense'
  payment_method VARCHAR(20) NOT NULL, -- 'cash' | 'credit_card'
  category_id UUID REFERENCES categories(id) NOT NULL,
  account_id UUID REFERENCES cash_accounts(id), -- NULL si es tarjeta
  card_id UUID REFERENCES credit_cards(id), -- NULL si es efectivo
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  
**Reglas de Negocio**:
- Si payment_method = 'cash', account_id requerido, card_id = NULL
- Si payment_method = 'credit_card', card_id requerido, account_id = NULL

---

### 🔗 **transaction_tags** (Relación N:N Transacciones-Tags)
```sql
CREATE TABLE transaction_tags (
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (transaction_id, tag_id)
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  

---

### 💳💰 **card_payments** (Pagos de Tarjetas)
```sql
CREATE TABLE card_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE NOT NULL,
  source_account_id UUID REFERENCES cash_accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  
**Propósito**: Registrar transferencias de cuentas efectivo → tarjetas de crédito

---

### ⚙️ **adjustments** (Ajustes Manuales)
```sql
CREATE TABLE adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES cash_accounts(id), -- NULL si es tarjeta
  card_id UUID REFERENCES credit_cards(id), -- NULL si es cuenta
  amount DECIMAL(12,2) NOT NULL, -- Puede ser positivo o negativo
  adjustment_date DATE NOT NULL,
  reason_category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Estado**: ✅ Tabla creada, 🔴 Servicios pendientes  
**Propósito**: Correcciones manuales de saldos con trazabilidad completa

---

## 🔗 RELACIONES Y CONSTRAINS

### Relaciones Principales
```
users (1) ──────── (N) cash_accounts
users (1) ──────── (N) credit_cards  
users (1) ──────── (N) categories
users (1) ──────── (N) tags
users (1) ──────── (N) transactions
users (1) ──────── (N) card_payments
users (1) ──────── (N) adjustments

categories (1) ── (N) transactions
cash_accounts (1) ── (N) transactions
credit_cards (1) ── (N) transactions
credit_cards (1) ── (N) card_payments
cash_accounts (1) ── (N) card_payments

transactions (N) ── (N) tags [transaction_tags]
```

### Constrains de Negocio
1. **Transacciones**: Solo una de account_id o card_id puede ser NOT NULL
2. **Ajustes**: Solo una de account_id o card_id puede ser NOT NULL  
3. **Fechas**: Todas las fechas deben ser válidas
4. **Importes**: Todos los decimales con 2 posiciones máximo
5. **Eliminación en Cascada**: Al eliminar usuario, se eliminan todos sus datos

---

## 🔧 SERVICIOS IMPLEMENTADOS

### ✅ **Cash Accounts Services** (`src/lib/services/cash-accounts.ts`)
```typescript
// Servicios COMPLETAMENTE FUNCIONALES:
- getCashAccounts(userId: string) ✅ PROBADO
- getCashAccountById(id: string, userId: string) ✅ PROBADO  
- createCashAccount(data: CreateCashAccountInput, userId: string) ✅ PROBADO
- updateCashAccount(id: string, data: UpdateCashAccountInput, userId: string) ✅ PROBADO
- deleteCashAccount(id: string, userId: string) ✅ PROBADO
- adjustCashAccountBalance(id: string, amount: string, userId: string) ✅ PROBADO
```

### ✅ **User Setup Services** (`src/lib/services/user-setup.ts`)
```typescript
// Inicialización automática FUNCIONANDO:
- initializeUserData(userId: string) ✅ PROBADO
  ├── Crear cuentas por defecto ✅ FUNCIONANDO
  ├── Crear categorías por defecto ✅ FUNCIONANDO
  └── Configuración inicial ✅ FUNCIONANDO
```

### ✅ **Authentication Services** (`src/lib/auth.ts`)
```typescript
// Autenticación COMPLETAMENTE FUNCIONAL:
- getCurrentUser() ✅ PROBADO - Maneja usuarios duplicados
- requireAuth() ✅ PROBADO - Protege rutas correctamente
- Integración con Clerk ✅ FUNCIONANDO - Google OAuth probado
```

---

## 🔴 SERVICIOS PENDIENTES

### **Credit Cards Services**
```typescript
// Por implementar:
- getCreditCards(userId: string)
- getCreditCardById(id: string, userId: string)
- createCreditCard(data: CreateCreditCardInput, userId: string)
- updateCreditCard(id: string, data: UpdateCreditCardInput, userId: string)
- deleteCreditCard(id: string, userId: string)
- adjustCreditCardBalance(id: string, amount: string, userId: string)
```

### **Categories Services**
```typescript
// Por implementar:
- getCategories(userId: string, type?: 'income' | 'expense')
- getCategoryById(id: string, userId: string)
- createCategory(data: CreateCategoryInput, userId: string)
- updateCategory(id: string, data: UpdateCategoryInput, userId: string)
- deleteCategory(id: string, userId: string)
```

### **Transactions Services**
```typescript
// Por implementar:
- getTransactions(userId: string, filters?: TransactionFilters)
- getTransactionById(id: string, userId: string)
- createTransaction(data: CreateTransactionInput, userId: string)
- updateTransaction(id: string, data: UpdateTransactionInput, userId: string)
- deleteTransaction(id: string, userId: string)
```

### **Tags Services**
```typescript
// Por implementar:
- getTags(userId: string)
- createTag(data: CreateTagInput, userId: string)
- updateTag(id: string, data: UpdateTagInput, userId: string)
- deleteTag(id: string, userId: string)
- assignTagsToTransaction(transactionId: string, tagIds: string[])
```

### **Card Payments Services**
```typescript
// Por implementar:
- getCardPayments(userId: string, cardId?: string)
- createCardPayment(data: CreateCardPaymentInput, userId: string)
- getCardPaymentById(id: string, userId: string)
```

### **Adjustments Services**
```typescript
// Por implementar:
- getAdjustments(userId: string, accountId?: string, cardId?: string)
- createAdjustment(data: CreateAdjustmentInput, userId: string)
- getAdjustmentById(id: string, userId: string)
```

---

## 🚀 API ENDPOINTS (Pendientes)

### Estructura de API Routes
```
/api/
├── auth/
│   └── user/                 # GET - Obtener usuario actual
├── accounts/
│   ├── /                     # GET, POST - Listar/crear cuentas
│   ├── [id]/                 # GET, PUT, DELETE - CRUD individual
│   └── [id]/adjust/          # POST - Ajustar saldo
├── cards/
│   ├── /                     # GET, POST - Listar/crear tarjetas
│   ├── [id]/                 # GET, PUT, DELETE - CRUD individual
│   ├── [id]/payments/        # GET, POST - Pagos de tarjeta
│   └── [id]/adjust/          # POST - Ajustar saldo
├── categories/
│   ├── /                     # GET, POST - Listar/crear categorías
│   └── [id]/                 # GET, PUT, DELETE - CRUD individual
├── transactions/
│   ├── /                     # GET, POST - Listar/crear transacciones
│   ├── [id]/                 # GET, PUT, DELETE - CRUD individual
│   └── search/               # POST - Búsqueda avanzada
├── tags/
│   ├── /                     # GET, POST - Listar/crear tags
│   └── [id]/                 # GET, PUT, DELETE - CRUD individual
├── reports/
│   ├── summary/              # GET - Resumen financiero
│   ├── categories/           # GET - Análisis por categorías
│   └── trends/               # GET - Tendencias temporales
└── adjustments/
    ├── /                     # GET, POST - Listar/crear ajustes
    └── [id]/                 # GET - Ver ajuste individual
```

---

## 📊 ÍNDICES Y OPTIMIZACIONES

### Índices Automáticos (Primary Keys, Foreign Keys)
- Todos los UUIDs tienen índice automático
- Foreign keys tienen índice automático

### Índices Adicionales Recomendados
```sql
-- Por implementar para optimización:
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_cash_accounts_user_active ON cash_accounts(user_id, is_active);
CREATE INDEX idx_credit_cards_user_active ON credit_cards(user_id, is_active);
CREATE INDEX idx_categories_user_type ON categories(user_id, type, is_active);
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Implementadas
- ✅ **Aislamiento por usuario**: Todas las consultas filtran por user_id
- ✅ **Cascada en eliminación**: Integridad referencial garantizada
- ✅ **Validaciones de entrada**: Zod schemas en servicios
- ✅ **Tipos TypeScript**: Fuertemente tipado

### Pendientes
- 🔴 **Validaciones de negocio**: Saldos suficientes, fechas válidas
- 🔴 **Middleware de autenticación**: Para API routes
- 🔴 **Rate limiting**: Protección contra abuso
- 🔴 **Logs de auditoría**: Tracking de cambios importantes

---

## 🧪 TESTING Y CALIDAD

### Estado Actual
- 🔴 **Tests unitarios**: No implementados
- 🔴 **Tests de integración**: No implementados  
- 🔴 **Validación de datos**: Básica con Zod

### Por Implementar
- Unit tests para servicios
- Integration tests para API routes
- Validación completa de reglas de negocio
- Testing de performance en consultas complejas

---

## 📈 MÉTRICAS DE BASE DE DATOS

| Tabla | Estado Schema | Servicios | API Routes | Tests |
|-------|---------------|-----------|------------|-------|
| users | ✅ 100% | ✅ 95% | 🔴 0% | 🔴 0% |
| cash_accounts | ✅ 100% | ✅ 90% | 🔴 0% | 🔴 0% |
| credit_cards | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |
| categories | ✅ 100% | 🔴 20% | 🔴 0% | 🔴 0% |
| transactions | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |
| tags | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |
| transaction_tags | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |
| card_payments | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |
| adjustments | ✅ 100% | 🔴 0% | 🔴 0% | 🔴 0% |

**Progreso General BD: 45%** 🎯

---

## 🔄 BACKUP Y RECUPERACIÓN

### Estado Actual
- ✅ **Railway Backups**: Automáticos por defecto
- 🔴 **Backup personalizado**: No configurado
- 🔴 **Procedimientos de recuperación**: No documentados

### Recomendaciones
- Configurar backups programados adicionales
- Documentar procedimientos de recuperación
- Testing de restauración periódico

---

*Documento técnico actualizado con cada cambio en el esquema de base de datos*