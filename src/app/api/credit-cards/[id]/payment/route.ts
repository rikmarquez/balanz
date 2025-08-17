import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { processCreditCardPayment } from '@/lib/services/credit-cards';
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  accountId: z.string().min(1, 'La cuenta es requerida'),
  description: z.string().optional()
});

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = PaymentSchema.parse(body);
        const result = await processCreditCardPayment(
          params.id, 
          validatedData, 
          user.id
        );
        
        if (!result.success) {
          return errorResponse(result.error || 'Error al procesar el pago', 400);
        }
        
        return successResponse(result.data, 'Pago procesado exitosamente');
      } catch (error) {
        if (error instanceof z.ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`POST /api/credit-cards/${params.id}/payment error:`, error);
    return errorResponse('Error al procesar el pago', 500);
  }
}