import { pgTable, uuid, varchar, decimal, timestamp, integer, text, boolean, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  clerkId: varchar('clerk_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  initialBalance: decimal('initial_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const creditCards = pgTable('credit_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }).notNull(),
  initialBalance: decimal('initial_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  cutDay: integer('cut_day').notNull(),
  dueDay: integer('due_day').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#6B7280'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense' | 'transfer'
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 'cash' | 'credit_card'
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  accountId: uuid('account_id').references(() => cashAccounts.id),
  cardId: uuid('card_id').references(() => creditCards.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionTags = pgTable('transaction_tags', {
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

export const cardPayments = pgTable('card_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cardId: uuid('card_id').references(() => creditCards.id, { onDelete: 'cascade' }).notNull(),
  sourceAccountId: uuid('source_account_id').references(() => cashAccounts.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: date('payment_date').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adjustments = pgTable('adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: uuid('account_id').references(() => cashAccounts.id),
  cardId: uuid('card_id').references(() => creditCards.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  adjustmentDate: date('adjustment_date').notNull(),
  reasonCategory: varchar('reason_category', { length: 50 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accountTransfers = pgTable('account_transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  fromAccountId: uuid('from_account_id').references(() => cashAccounts.id, { onDelete: 'cascade' }).notNull(),
  toAccountId: uuid('to_account_id').references(() => cashAccounts.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  transferDate: date('transfer_date').notNull(),
  description: text('description').notNull(),
  transferType: varchar('transfer_type', { length: 30 }).notNull(), // 'atm_withdrawal' | 'internal_transfer' | 'cash_deposit'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const balanceAdjustments = pgTable('balance_adjustments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: uuid('account_id').references(() => cashAccounts.id),
  creditCardId: uuid('credit_card_id').references(() => creditCards.id),
  previousBalance: decimal('previous_balance', { precision: 12, scale: 2 }).notNull(),
  newBalance: decimal('new_balance', { precision: 12, scale: 2 }).notNull(),
  adjustmentAmount: decimal('adjustment_amount', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cashAccounts: many(cashAccounts),
  creditCards: many(creditCards),
  categories: many(categories),
  tags: many(tags),
  transactions: many(transactions),
  cardPayments: many(cardPayments),
  accountTransfers: many(accountTransfers),
  adjustments: many(adjustments),
  balanceAdjustments: many(balanceAdjustments),
}));

export const cashAccountsRelations = relations(cashAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [cashAccounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  cardPayments: many(cardPayments),
  fromAccountTransfers: many(accountTransfers, {
    relationName: 'fromAccount',
  }),
  toAccountTransfers: many(accountTransfers, {
    relationName: 'toAccount',
  }),
  adjustments: many(adjustments),
  balanceAdjustments: many(balanceAdjustments),
}));

export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  user: one(users, {
    fields: [creditCards.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  cardPayments: many(cardPayments),
  adjustments: many(adjustments),
  balanceAdjustments: many(balanceAdjustments),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  transactionTags: many(transactionTags),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  account: one(cashAccounts, {
    fields: [transactions.accountId],
    references: [cashAccounts.id],
  }),
  card: one(creditCards, {
    fields: [transactions.cardId],
    references: [creditCards.id],
  }),
  transactionTags: many(transactionTags),
}));

export const transactionTagsRelations = relations(transactionTags, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionTags.transactionId],
    references: [transactions.id],
  }),
  tag: one(tags, {
    fields: [transactionTags.tagId],
    references: [tags.id],
  }),
}));

export const cardPaymentsRelations = relations(cardPayments, ({ one }) => ({
  user: one(users, {
    fields: [cardPayments.userId],
    references: [users.id],
  }),
  card: one(creditCards, {
    fields: [cardPayments.cardId],
    references: [creditCards.id],
  }),
  sourceAccount: one(cashAccounts, {
    fields: [cardPayments.sourceAccountId],
    references: [cashAccounts.id],
  }),
}));

export const accountTransfersRelations = relations(accountTransfers, ({ one }) => ({
  user: one(users, {
    fields: [accountTransfers.userId],
    references: [users.id],
  }),
  fromAccount: one(cashAccounts, {
    fields: [accountTransfers.fromAccountId],
    references: [cashAccounts.id],
    relationName: 'fromAccount',
  }),
  toAccount: one(cashAccounts, {
    fields: [accountTransfers.toAccountId],
    references: [cashAccounts.id],
    relationName: 'toAccount',
  }),
}));

export const adjustmentsRelations = relations(adjustments, ({ one }) => ({
  user: one(users, {
    fields: [adjustments.userId],
    references: [users.id],
  }),
  account: one(cashAccounts, {
    fields: [adjustments.accountId],
    references: [cashAccounts.id],
  }),
  card: one(creditCards, {
    fields: [adjustments.cardId],
    references: [creditCards.id],
  }),
}));

export const balanceAdjustmentsRelations = relations(balanceAdjustments, ({ one }) => ({
  user: one(users, {
    fields: [balanceAdjustments.userId],
    references: [users.id],
  }),
  account: one(cashAccounts, {
    fields: [balanceAdjustments.accountId],
    references: [cashAccounts.id],
  }),
  creditCard: one(creditCards, {
    fields: [balanceAdjustments.creditCardId],
    references: [creditCards.id],
  }),
}));