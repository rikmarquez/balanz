import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { 
  getTransactions, 
  createTransaction, 
  getFilteredTransactions,
  CreateTransactionSchema,
  TransactionFilters 
} from '@/lib/services/transactions';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const { searchParams } = new URL(request.url);
      
      // Parsear parámetros de filtros
      const filters: TransactionFilters = {};
      const limitParam = searchParams.get('limit');
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;
      
      // Filtros de fecha
      if (searchParams.get('startDate')) {
        filters.startDate = searchParams.get('startDate')!;
      }
      if (searchParams.get('endDate')) {
        filters.endDate = searchParams.get('endDate')!;
      }
      
      // Filtros de categorías (separadas por comas)
      const categoryIds = searchParams.get('categoryIds');
      if (categoryIds) {
        filters.categoryIds = categoryIds.split(',').filter(id => id.length > 0);
      }
      
      // Filtros de tags (separados por comas)
      const tagIds = searchParams.get('tagIds');
      if (tagIds) {
        filters.tagIds = tagIds.split(',').filter(id => id.length > 0);
      }
      
      // Otros filtros
      if (searchParams.get('paymentMethod')) {
        filters.paymentMethod = searchParams.get('paymentMethod') as 'cash' | 'credit_card';
      }
      if (searchParams.get('type')) {
        filters.type = searchParams.get('type') as 'income' | 'expense';
      }
      if (searchParams.get('accountId')) {
        filters.accountId = searchParams.get('accountId')!;
      }
      if (searchParams.get('cardId')) {
        filters.cardId = searchParams.get('cardId')!;
      }
      if (searchParams.get('searchText')) {
        filters.searchText = searchParams.get('searchText')!;
      }
      
      // Usar filtros si hay alguno, sino usar función básica
      const hasFilters = Object.keys(filters).length > 0;
      const transactions = hasFilters 
        ? await getFilteredTransactions(user.id, filters, limit)
        : await getTransactions(user.id, limit);
      
      return successResponse(transactions);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/transactions error:', error);
    return errorResponse('Error al obtener las transacciones', 500);
  }
}

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = CreateTransactionSchema.parse(body);
        const newTransaction = await createTransaction(validatedData, user.id);
        return successResponse(newTransaction, 'Transacción creada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/transactions error:', error);
    return errorResponse('Error al crear la transacción', 500);
  }
}