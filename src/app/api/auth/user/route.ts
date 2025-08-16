import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      return successResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        clerkId: user.clerkId,
        createdAt: user.createdAt,
      });
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/auth/user error:', error);
    return errorResponse('Error al obtener el usuario', 500);
  }
}