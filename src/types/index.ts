import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense', 'transfer']);
export const PaymentMethodSchema = z.enum(['cash', 'credit_card']);
export const CategoryTypeSchema = z.enum(['income', 'expense']);

export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

export interface User {
  id: string;
  email: string;
  clerkId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashAccount {
  id: string;
  userId: string;
  name: string;
  initialBalance: string;
  currentBalance: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  creditLimit: string;
  initialBalance: string;
  currentBalance: string;
  cutDay: number;
  dueDay: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: string;
  date: string;
  description: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  categoryId: string;
  accountId?: string;
  cardId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  account?: CashAccount;
  card?: CreditCard;
  tags?: Tag[];
}

export interface CardPayment {
  id: string;
  userId: string;
  cardId: string;
  sourceAccountId: string;
  amount: string;
  paymentDate: string;
  description?: string;
  createdAt: Date;
  card?: CreditCard;
  sourceAccount?: CashAccount;
}

export interface Adjustment {
  id: string;
  userId: string;
  accountId?: string;
  cardId?: string;
  amount: string;
  adjustmentDate: string;
  reasonCategory: string;
  description: string;
  createdAt: Date;
  account?: CashAccount;
  card?: CreditCard;
}

// Default categories
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Coaching', color: '#10B981' },
  { name: 'Consultoría', color: '#3B82F6' },
  { name: 'Cursos', color: '#8B5CF6' },
  { name: 'Productos digitales', color: '#F59E0B' },
  { name: 'Desarrollo', color: '#EF4444' },
  { name: 'Mantenimiento', color: '#06B6D4' },
  { name: 'YouTube', color: '#EC4899' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Formación', color: '#10B981' },
  { name: 'Gasolina', color: '#F59E0B' },
  { name: 'Viáticos', color: '#3B82F6' },
  { name: 'Chivo', color: '#8B5CF6' },
  { name: 'Sueldo', color: '#EF4444' },
  { name: 'Gusgas', color: '#06B6D4' },
  { name: 'Medicina', color: '#EC4899' },
  { name: 'Streaming', color: '#84CC16' },
  { name: 'Diversión', color: '#F97316' },
  { name: 'Servicios', color: '#6366F1' },
  { name: 'Hogar', color: '#14B8A6' },
  { name: 'Personales', color: '#A855F7' },
  { name: 'Pago de tarjeta', color: '#DC2626' },
];

// Default cash accounts
export const DEFAULT_CASH_ACCOUNTS = [
  { name: 'Personal', initialBalance: '0' },
  { name: 'Fiscal', initialBalance: '0' },
  { name: 'Nómina', initialBalance: '0' },
  { name: 'Caja Popular', initialBalance: '0' },
  { name: 'Efectivo', initialBalance: '0' },
];