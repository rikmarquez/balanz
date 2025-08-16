import { ApiResponse } from './response';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en la petición');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request('/auth/user');
  }

  // Cash Accounts endpoints
  async getCashAccounts() {
    return this.request('/accounts');
  }

  async getCashAccount(id: string) {
    return this.request(`/accounts/${id}`);
  }

  async createCashAccount(data: { name: string; initialBalance: string }) {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCashAccount(id: string, data: { name: string; isActive?: boolean }) {
    return this.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCashAccount(id: string) {
    return this.request(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // Credit Cards endpoints (por implementar)
  async getCreditCards() {
    return this.request('/cards');
  }

  async createCreditCard(data: any) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Categories endpoints (por implementar)
  async getCategories(type?: 'income' | 'expense') {
    const query = type ? `?type=${type}` : '';
    return this.request(`/categories${query}`);
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transactions endpoints (por implementar)
  async getTransactions(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/transactions${query}`);
  }

  async createTransaction(data: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tags endpoints (por implementar)
  async getTags() {
    return this.request('/tags');
  }

  async createTag(data: any) {
    return this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports endpoints (por implementar)
  async getFinancialSummary() {
    return this.request('/reports/summary');
  }

  async getCategoryAnalysis() {
    return this.request('/reports/categories');
  }
}

export const apiClient = new ApiClient();