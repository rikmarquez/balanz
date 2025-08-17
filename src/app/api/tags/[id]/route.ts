import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTagById, updateTag, deleteTag, UpdateTagSchema } from '@/lib/services/tags';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const tag = await getTagById(params.id, user.id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const data = await request.json();
    
    const result = UpdateTagSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const tag = await updateTag(params.id, result.data, user.id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const tag = await deleteTag(params.id, user.id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tag eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}