import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { 
  getCategories, 
  createCategory, 
  CreateCategorySchema 
} from '@/lib/services/categories';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') as 'income' | 'expense' | null;
      
      const categories = await getCategories(user.id, type || undefined);
      return successResponse(categories);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/categories error:', error);
    return errorResponse('Error al obtener las categorías', 500);
  }
}

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = CreateCategorySchema.parse(body);
        const newCategory = await createCategory(validatedData, user.id);
        return successResponse(newCategory, 'Categoría creada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/categories error:', error);
    return errorResponse('Error al crear la categoría', 500);
  }
}