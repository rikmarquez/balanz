import { db } from '../db';
import { cashAccounts, categories } from '../db/schema';
import { DEFAULT_CASH_ACCOUNTS, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/types';

export async function initializeUserData(userId: string) {
  try {
    // Create default cash accounts
    const cashAccountsData = DEFAULT_CASH_ACCOUNTS.map(account => ({
      userId,
      name: account.name,
      initialBalance: account.initialBalance,
      currentBalance: account.initialBalance,
    }));

    await db.insert(cashAccounts).values(cashAccountsData);

    // Create default income categories
    const incomeCategories = DEFAULT_INCOME_CATEGORIES.map(category => ({
      userId,
      name: category.name,
      type: 'income' as const,
      color: category.color,
    }));

    // Create default expense categories
    const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map(category => ({
      userId,
      name: category.name,
      type: 'expense' as const,
      color: category.color,
    }));

    await db.insert(categories).values([...incomeCategories, ...expenseCategories]);

    console.log('User data initialized successfully for user:', userId);
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
}