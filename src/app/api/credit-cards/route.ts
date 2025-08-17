import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { 
  getCreditCards, 
  createCreditCard, 
  CreateCreditCardSchema 
} from '@/lib/services/credit-cards';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const cards = await getCreditCards(user.id);
      return successResponse(cards);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/credit-cards error:', error);
    return errorResponse('Error al obtener las tarjetas', 500);
  }
}

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = CreateCreditCardSchema.parse(body);
        const newCard = await createCreditCard(validatedData, user.id);
        return successResponse(newCard, 'Tarjeta creada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/credit-cards error:', error);
    return errorResponse('Error al crear la tarjeta', 500);
  }
}