import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { accountTransfers, cashAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateTransferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive(),
  transferDate: z.string(),
  description: z.string().min(1),
  transferType: z.enum(['atm_withdrawal', 'internal_transfer', 'cash_deposit']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfer = await db
      .select({
        id: accountTransfers.id,
        amount: accountTransfers.amount,
        transferDate: accountTransfers.transferDate,
        description: accountTransfers.description,
        transferType: accountTransfers.transferType,
        fromAccountId: accountTransfers.fromAccountId,
        toAccountId: accountTransfers.toAccountId,
        createdAt: accountTransfers.createdAt,
      })
      .from(accountTransfers)
      .where(
        and(
          eq(accountTransfers.id, params.id),
          eq(accountTransfers.userId, user.id)
        )
      )
      .limit(1);

    if (transfer.length === 0) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(transfer[0]);
  } catch (error) {
    console.error('Error fetching transfer:', error);
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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTransferSchema.parse(body);

    // Obtener la transferencia actual
    const currentTransfer = await db
      .select()
      .from(accountTransfers)
      .where(
        and(
          eq(accountTransfers.id, params.id),
          eq(accountTransfers.userId, user.id)
        )
      )
      .limit(1);

    if (currentTransfer.length === 0) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    const originalTransfer = currentTransfer[0];

    // Obtener las cuentas involucradas (original y nueva)
    const allAccountIds = Array.from(new Set([
      originalTransfer.fromAccountId,
      originalTransfer.toAccountId,
      validatedData.fromAccountId,
      validatedData.toAccountId,
    ]));

    const accounts = await db
      .select()
      .from(cashAccounts)
      .where(
        and(
          eq(cashAccounts.userId, user.id),
        )
      );

    const accountsMap = new Map(accounts.map(acc => [acc.id, acc]));

    // Validar que todas las cuentas existan
    for (const accountId of allAccountIds) {
      if (!accountsMap.has(accountId)) {
        return NextResponse.json(
          { error: 'Una o más cuentas no existen' },
          { status: 400 }
        );
      }
    }

    if (validatedData.fromAccountId === validatedData.toAccountId) {
      return NextResponse.json(
        { error: 'La cuenta origen y destino no pueden ser la misma' },
        { status: 400 }
      );
    }

    // Actualizar la transferencia y recalcular saldos
    await db.transaction(async (tx) => {
      // Revertir el efecto de la transferencia original
      const originalFromAccount = accountsMap.get(originalTransfer.fromAccountId)!;
      const originalToAccount = accountsMap.get(originalTransfer.toAccountId)!;
      const originalAmount = parseFloat(originalTransfer.amount);

      // Restaurar saldos originales
      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(originalFromAccount.currentBalance) + originalAmount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, originalTransfer.fromAccountId));

      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(originalToAccount.currentBalance) - originalAmount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, originalTransfer.toAccountId));

      // Obtener saldos actualizados
      const newFromAccount = accountsMap.get(validatedData.fromAccountId)!;
      const newToAccount = accountsMap.get(validatedData.toAccountId)!;

      // Verificar saldo suficiente con los nuevos valores
      const newFromBalance = validatedData.fromAccountId === originalTransfer.fromAccountId
        ? parseFloat(originalFromAccount.currentBalance) + originalAmount
        : parseFloat(newFromAccount.currentBalance);

      if (newFromBalance < validatedData.amount) {
        throw new Error('Saldo insuficiente en la cuenta origen');
      }

      // Aplicar la nueva transferencia
      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (newFromBalance - validatedData.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, validatedData.fromAccountId));

      const newToBalance = validatedData.toAccountId === originalTransfer.toAccountId
        ? parseFloat(originalToAccount.currentBalance) - originalAmount
        : parseFloat(newToAccount.currentBalance);

      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (newToBalance + validatedData.amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, validatedData.toAccountId));

      // Actualizar el registro de transferencia
      await tx
        .update(accountTransfers)
        .set({
          fromAccountId: validatedData.fromAccountId,
          toAccountId: validatedData.toAccountId,
          amount: validatedData.amount.toString(),
          transferDate: validatedData.transferDate,
          description: validatedData.description,
          transferType: validatedData.transferType,
          updatedAt: new Date(),
        })
        .where(eq(accountTransfers.id, params.id));
    });

    return NextResponse.json({ message: 'Transferencia actualizada exitosamente' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating transfer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener la transferencia a eliminar
    const transfer = await db
      .select()
      .from(accountTransfers)
      .where(
        and(
          eq(accountTransfers.id, params.id),
          eq(accountTransfers.userId, user.id)
        )
      )
      .limit(1);

    if (transfer.length === 0) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    const transferToDelete = transfer[0];

    // Obtener las cuentas involucradas
    const accounts = await db
      .select()
      .from(cashAccounts)
      .where(eq(cashAccounts.userId, user.id));

    const fromAccount = accounts.find(acc => acc.id === transferToDelete.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === transferToDelete.toAccountId);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'Una o ambas cuentas no existen' },
        { status: 400 }
      );
    }

    // Eliminar la transferencia y revertir los saldos
    await db.transaction(async (tx) => {
      const amount = parseFloat(transferToDelete.amount);

      // Revertir el efecto en los saldos
      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(fromAccount.currentBalance) + amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, transferToDelete.fromAccountId));

      await tx
        .update(cashAccounts)
        .set({
          currentBalance: (parseFloat(toAccount.currentBalance) - amount).toString(),
          updatedAt: new Date(),
        })
        .where(eq(cashAccounts.id, transferToDelete.toAccountId));

      // Eliminar el registro
      await tx
        .delete(accountTransfers)
        .where(eq(accountTransfers.id, params.id));
    });

    return NextResponse.json({ message: 'Transferencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}