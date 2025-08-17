import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse 
} from '@/lib/api/response';
import { 
  getCategoryById, 
  updateCategory, 
  deleteCategory,
  UpdateCategorySchema 
} from '@/lib/services/categories';
import { ZodError } from 'zod';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const category = await getCategoryById(params.id, user.id);
      
      if (!category) {
        return notFoundResponse('Categoría');
      }
      
      return successResponse(category);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`GET /api/categories/${params.id} error:`, error);
    return errorResponse('Error al obtener la categoría', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['PUT']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = UpdateCategorySchema.parse(body);
        const updatedCategory = await updateCategory(params.id, validatedData, user.id);
        
        if (!updatedCategory) {
          return notFoundResponse('Categoría');
        }
        
        return successResponse(updatedCategory, 'Categoría actualizada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`PUT /api/categories/${params.id} error:`, error);
    return errorResponse('Error al actualizar la categoría', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const methodError = validateMethod(request, ['DELETE']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const deletedCategory = await deleteCategory(params.id, user.id);
      
      if (!deletedCategory) {
        return notFoundResponse('Categoría');
      }
      
      return successResponse(null, 'Categoría eliminada exitosamente');
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(`DELETE /api/categories/${params.id} error:`, error);
    return errorResponse('Error al eliminar la categoría', 500);
  }
}