import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTags, createTag, CreateTagSchema } from '@/lib/services/tags';

export async function GET() {
  try {
    const user = await requireAuth();
    const tags = await getTags(user.id);
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    const result = CreateTagSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const tag = await createTag(result.data, user.id);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}