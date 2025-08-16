import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { 
  getCashAccountById, 
  updateCashAccount, 
  deleteCashAccount,
  UpdateCashAccountSchema 
} from '@/lib/services/cash-accounts';
import { ZodError } from 'zod';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const account = await getCashAccountById(params.id, user.id);
      
      if (!account) {
        return notFoundResponse('Cuenta');
      }
      
      return successResponse(account);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`GET /api/accounts/${params.id} error:`, error);
    return errorResponse('Error al obtener la cuenta', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['PUT']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = UpdateCashAccountSchema.parse(body);
        const updatedAccount = await updateCashAccount(params.id, validatedData, user.id);
        
        if (!updatedAccount) {
          return notFoundResponse('Cuenta');
        }
        
        return successResponse(updatedAccount, 'Cuenta actualizada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`PUT /api/accounts/${params.id} error:`, error);
    return errorResponse('Error al actualizar la cuenta', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['DELETE']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const deletedAccount = await deleteCashAccount(params.id, user.id);
      
      if (!deletedAccount) {
        return notFoundResponse('Cuenta');
      }
      
      return successResponse(null, 'Cuenta eliminada exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`DELETE /api/accounts/${params.id} error:`, error);
    return errorResponse('Error al eliminar la cuenta', 500);
  }
}