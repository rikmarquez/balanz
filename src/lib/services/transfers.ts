import { ApiResponse } from '@/lib/api/response';

export interface AccountTransfer {
  id: string;
  amount: string;
  transferDate: string;
  description: string;
  transferType: 'atm_withdrawal' | 'internal_transfer' | 'cash_deposit';
  fromAccountId?: string;
  toAccountId?: string;
  fromAccount?: {
    id: string;
    name: string;
  };
  toAccount?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateTransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transferDate: string;
  description: string;
  transferType: 'atm_withdrawal' | 'internal_transfer' | 'cash_deposit';
}

export interface UpdateTransferData extends CreateTransferData {}

export const transfersService = {
  async getAll(): Promise<ApiResponse<AccountTransfer[]>> {
    try {
      const response = await fetch('/api/transfers');
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al obtener transferencias' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  async getById(id: string): Promise<ApiResponse<AccountTransfer>> {
    try {
      const response = await fetch(`/api/transfers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al obtener transferencia' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching transfer:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  async create(transferData: CreateTransferData): Promise<ApiResponse<void>> {
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al crear transferencia' };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error creating transfer:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  async update(id: string, transferData: UpdateTransferData): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/transfers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al actualizar transferencia' };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error updating transfer:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/transfers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al eliminar transferencia' };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error('Error deleting transfer:', error);
      return { success: false, error: 'Error de conexión' };
    }
  },
};

export const transferTypeLabels = {
  atm_withdrawal: 'Retiro de cajero',
  internal_transfer: 'Transf. entre cuentas',
  cash_deposit: 'Depósito en efectivo',
} as const;