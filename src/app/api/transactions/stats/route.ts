import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getFilteredTransactionStats } from '@/lib/services/transactions-stats';
import { TransactionFilters } from '@/lib/services/transactions';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const { searchParams } = new URL(request.url);

      // Construir filtros desde query params
      const filters: TransactionFilters = {};

      if (searchParams.get('startDate')) {
        filters.startDate = searchParams.get('startDate')!;
      }
      if (searchParams.get('endDate')) {
        filters.endDate = searchParams.get('endDate')!;
      }
      if (searchParams.get('categoryIds')) {
        filters.categoryIds = searchParams.get('categoryIds')!.split(',');
      }
      if (searchParams.get('tagIds')) {
        filters.tagIds = searchParams.get('tagIds')!.split(',');
      }
      if (searchParams.get('paymentMethod')) {
        filters.paymentMethod = searchParams.get('paymentMethod') as 'cash' | 'credit_card';
      }
      if (searchParams.get('type')) {
        filters.type = searchParams.get('type') as 'income' | 'expense' | 'transfer';
      }
      if (searchParams.get('egressType')) {
        filters.egressType = searchParams.get('egressType') as 'all' | 'cash_only' | 'transfers_only';
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

      const stats = await getFilteredTransactionStats(user.id, filters);
      return successResponse(stats);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/transactions/stats error:', error);
    return errorResponse('Error al obtener estadísticas de transacciones', 500);
  }
}
