import { NextRequest } from 'next/server';
import { withAuth, validateMethod } from '@/lib/api/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { 
  getCashAccounts, 
  createCashAccount, 
  CreateCashAccountSchema 
} from '@/lib/services/cash-accounts';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const accounts = await getCashAccounts(user.id);
      return successResponse(accounts);
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('GET /api/accounts error:', error);
    return errorResponse('Error al obtener las cuentas', 500);
  }
}

export async function POST(request: NextRequest) {
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  try {
    return await withAuth(request, async (user) => {
      const body = await request.json();
      
      try {
        const validatedData = CreateCashAccountSchema.parse(body);
        const newAccount = await createCashAccount(validatedData, user.id);
        return successResponse(newAccount, 'Cuenta creada exitosamente');
      } catch (error) {
        if (error instanceof ZodError) {
          return validationErrorResponse(error);
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('POST /api/accounts error:', error);
    return errorResponse('Error al crear la cuenta', 500);
  }
}