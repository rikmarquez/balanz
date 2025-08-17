import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { 
  updateInitialBalance,
  UpdateInitialBalanceSchema 
} from '@/lib/services/cash-accounts';
import { ZodError } from 'zod';

interface RouteContext {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['PUT']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = UpdateInitialBalanceSchema.parse(body);
        const updatedAccount = await updateInitialBalance(params.id, validatedData.initialBalance, user.id);
        
        if (!updatedAccount) {
          return notFoundResponse('Cuenta');
        }
        
        return successResponse(updatedAccount, 'Saldo inicial actualizado exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`PUT /api/accounts/${params.id}/initial-balance error:`, error);
    
    // Manejar errores específicos
    if (error instanceof Error && error.message.includes('movimientos')) {
      return errorResponse(error.message, 400);
    }
    
    return errorResponse('Error al actualizar el saldo inicial', 500);
  }
}