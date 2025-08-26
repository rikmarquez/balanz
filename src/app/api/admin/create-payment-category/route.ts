import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getOrCreatePaymentCategory } from '@/lib/services/categories';

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const categoryId = await getOrCreatePaymentCategory(user.id);
      
      return successResponse({ 
        categoryId,
        message: 'Categoría "Pago de Tarjeta" creada/verificada exitosamente'
      }, 'Categoría de pago de tarjeta disponible');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/admin/create-payment-category error:', error);
    return errorResponse('Error al crear categoría de pago de tarjeta', 500);
  }
}