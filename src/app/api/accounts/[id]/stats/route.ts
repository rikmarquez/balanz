import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAccountStats } from '@/lib/services/transactions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const accountId = params.id;

    const stats = await getAccountStats(accountId, user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching account stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de la cuenta' },
      { status: 500 }
    );
  }
}