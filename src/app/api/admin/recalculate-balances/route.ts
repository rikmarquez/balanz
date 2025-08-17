import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse
} from '@/lib/api/response';
import { recalculateAllBalances } from '@/lib/services/transactions';

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const result = await recalculateAllBalances(user.id);
      return successResponse(result, 'Saldos recalculados exitosamente');
    });
  } catch (error) {
    console.error('POST /api/admin/recalculate-balances error:', error);
    return errorResponse('Error al recalcular saldos', 500);
  }
}