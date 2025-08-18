import { getCurrentUser } from '@/lib/auth';
import { unauthorizedResponse, serverErrorResponse } from './response';
import { NextRequest } from 'next/server';

export async function withAuth<T>(
  request: NextRequest,
  handler: (user: any) => Promise<T>
): Promise<T> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw unauthorizedResponse();
    }

    return await handler(user);
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    
    console.error('Auth middleware error:', error);
    throw serverErrorResponse('Error de autenticación');
  }
}

export function validateMethod(request: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Método ${request.method} no permitido`,
      }),
      {
        status: 405,
        headers: {
          'Allow': allowedMethods.join(', '),
          'Content-Type': 'application/json',
        },
      }
    );
  }
  return null;
}