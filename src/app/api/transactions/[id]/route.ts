import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction,
  UpdateTransactionSchema 
} from '@/lib/services/transactions';
import { ZodError } from 'zod';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const transaction = await getTransactionById(params.id, user.id);
      
      if (!transaction) {
        return notFoundResponse('Transacción');
      }
      
      return successResponse(transaction);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`GET /api/transactions/${params.id} error:`, error);
    return errorResponse('Error al obtener la transacción', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['PUT']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = UpdateTransactionSchema.parse(body);
        const updatedTransaction = await updateTransaction(params.id, validatedData, user.id);
        
        if (!updatedTransaction) {
          return notFoundResponse('Transacción');
        }
        
        return successResponse(updatedTransaction, 'Transacción actualizada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`PUT /api/transactions/${params.id} error:`, error);
    return errorResponse('Error al actualizar la transacción', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['DELETE']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const deletedTransaction = await deleteTransaction(params.id, user.id);
      
      if (!deletedTransaction) {
        return notFoundResponse('Transacción');
      }
      
      return successResponse(null, 'Transacción eliminada exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`DELETE /api/transactions/${params.id} error:`, error);
    return errorResponse('Error al eliminar la transacción', 500);
  }
}