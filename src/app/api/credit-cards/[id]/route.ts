import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { 
  getCreditCardById, 
  updateCreditCard, 
  deleteCreditCard,
  UpdateCreditCardSchema 
} from '@/lib/services/credit-cards';
import { ZodError } from 'zod';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const card = await getCreditCardById(params.id, user.id);
      
      if (!card) {
        return notFoundResponse('Tarjeta');
      }
      
      return successResponse(card);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`GET /api/credit-cards/${params.id} error:`, error);
    return errorResponse('Error al obtener la tarjeta', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['PUT']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = UpdateCreditCardSchema.parse(body);
        const updatedCard = await updateCreditCard(params.id, validatedData, user.id);
        
        if (!updatedCard) {
          return notFoundResponse('Tarjeta');
        }
        
        return successResponse(updatedCard, 'Tarjeta actualizada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`PUT /api/credit-cards/${params.id} error:`, error);
    return errorResponse('Error al actualizar la tarjeta', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['DELETE']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const deletedCard = await deleteCreditCard(params.id, user.id);
      
      if (!deletedCard) {
        return notFoundResponse('Tarjeta');
      }
      
      return successResponse(null, 'Tarjeta eliminada exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`DELETE /api/credit-cards/${params.id} error:`, error);
    return errorResponse('Error al eliminar la tarjeta', 500);
  }
}