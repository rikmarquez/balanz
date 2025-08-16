import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function errorResponse(
  error: string | Error,
  status: number = 400
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error;
  
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const validationErrors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      success: false,
      error: 'Datos de entrada inválidos',
      data: validationErrors,
    },
    { status: 422 }
  );
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'No autorizado',
    },
    { status: 401 }
  );
}

export function notFoundResponse(resource: string = 'Recurso'): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} no encontrado`,
    },
    { status: 404 }
  );
}

export function serverErrorResponse(error?: string): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: error || 'Error interno del servidor',
    },
    { status: 500 }
  );
}