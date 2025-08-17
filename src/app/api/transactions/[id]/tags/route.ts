import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTagsByTransactionId } from '@/lib/services/tags';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(); // Verify user is authenticated
    const tags = await getTagsByTransactionId(params.id);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching transaction tags:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}