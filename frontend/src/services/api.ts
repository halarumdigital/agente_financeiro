import axios from 'axios';
import type { Transaction, Category, DashboardData, ApiResponse, SavingsBox, SavingsBoxTransaction } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getDashboard(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardData> {
  const response = await api.get<ApiResponse<DashboardData>>('/dashboard', { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar dashboard');
  }
  return response.data.data;
}

export async function getTransactions(params?: {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<Transaction[]> {
  const response = await api.get<ApiResponse<Transaction[]>>('/transactions', { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar transacoes');
  }
  return response.data.data;
}

export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  const response = await api.get<ApiResponse<Transaction[]>>('/transactions/recent', {
    params: { limit },
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar transacoes');
  }
  return response.data.data;
}

export async function createTransaction(data: {
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  category_id: number;
  date: string;
  notes?: string;
}): Promise<{ id: number }> {
  const response = await api.post<ApiResponse<{ id: number }>>('/transactions', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao criar transacao');
  }
  return response.data.data;
}

export async function getCategories(type?: 'income' | 'expense' | 'investment'): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories', {
    params: type ? { type } : undefined,
  });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar categorias');
  }
  return response.data.data;
}

export async function createCategory(data: {
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon?: string;
  color?: string;
}): Promise<{ id: number }> {
  const response = await api.post<ApiResponse<{ id: number }>>('/categories', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao criar categoria');
  }
  return response.data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro ao excluir categoria');
  }
}

export async function getSummary(year?: number, month?: number): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const response = await api.get<ApiResponse<{ income: number; expense: number; balance: number }>>(
    '/transactions/summary',
    { params: { year, month } }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar resumo');
  }
  return response.data.data;
}

// Savings Boxes (Caixinhas)
export async function getSavingsBoxes(): Promise<{ boxes: SavingsBox[]; total: number }> {
  const response = await api.get<ApiResponse<{ boxes: SavingsBox[]; total: number }>>('/savings-boxes');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar caixinhas');
  }
  return response.data.data;
}

export async function getSavingsBox(id: number): Promise<{ box: SavingsBox; transactions: SavingsBoxTransaction[] }> {
  const response = await api.get<ApiResponse<{ box: SavingsBox; transactions: SavingsBoxTransaction[] }>>(`/savings-boxes/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar caixinha');
  }
  return response.data.data;
}

export async function createSavingsBox(data: {
  name: string;
  description?: string;
  goal_amount?: number;
  icon?: string;
  color?: string;
}): Promise<{ id: number }> {
  const response = await api.post<ApiResponse<{ id: number }>>('/savings-boxes', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao criar caixinha');
  }
  return response.data.data;
}

export async function depositToSavingsBox(id: number, amount: number, description?: string): Promise<SavingsBox> {
  const response = await api.post<ApiResponse<SavingsBox>>(`/savings-boxes/${id}/deposit`, { amount, description });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao depositar');
  }
  return response.data.data;
}

export async function withdrawFromSavingsBox(id: number, amount: number, description?: string): Promise<SavingsBox> {
  const response = await api.post<ApiResponse<SavingsBox>>(`/savings-boxes/${id}/withdraw`, { amount, description });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao retirar');
  }
  return response.data.data;
}

export async function deleteSavingsBox(id: number): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(`/savings-boxes/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro ao excluir caixinha');
  }
}

// Reports (Relatorios)
export interface CategoryReport {
  category_id: number;
  category: string;
  type: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
}

export interface PeriodReport {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ReportsSummary {
  income: {
    total: number;
    count: number;
    average: number;
    biggest: {
      amount: number;
      description: string;
      category_name: string;
      date: string;
    } | null;
  };
  expense: {
    total: number;
    count: number;
    average: number;
    biggest: {
      amount: number;
      description: string;
      category_name: string;
      date: string;
    } | null;
    topCategory: {
      category: string;
      color: string;
      total: number;
    } | null;
  };
  balance: number;
  transactionCount: number;
  daysInPeriod: number;
}

export async function getReportsByCategory(params: {
  startDate: string;
  endDate: string;
  type?: 'income' | 'expense';
}): Promise<{ categories: CategoryReport[]; totals: { income: number; expense: number } }> {
  const response = await api.get<ApiResponse<{ categories: CategoryReport[]; totals: { income: number; expense: number } }>>(
    '/reports/by-category',
    { params }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar relatorio');
  }
  return response.data.data;
}

export async function getReportsByPeriod(params: {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}): Promise<PeriodReport[]> {
  const response = await api.get<ApiResponse<PeriodReport[]>>('/reports/by-period', { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar relatorio');
  }
  return response.data.data;
}

export async function getReportsTransactions(params: {
  startDate: string;
  endDate: string;
  type?: 'income' | 'expense';
  category_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{
  transactions: {
    id: number;
    type: string;
    amount: number;
    description: string;
    date: string;
    category_id: number;
    category_name: string;
    category_color: string;
  }[];
  total: number;
  limit: number;
  offset: number;
}> {
  const response = await api.get<ApiResponse<{
    transactions: any[];
    total: number;
    limit: number;
    offset: number;
  }>>('/reports/transactions', { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar transacoes');
  }
  return response.data.data;
}

export async function getReportsSummary(params: {
  startDate: string;
  endDate: string;
}): Promise<ReportsSummary> {
  const response = await api.get<ApiResponse<ReportsSummary>>('/reports/summary', { params });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar resumo');
  }
  return response.data.data;
}

// Bills (Contas a Pagar)
export interface Bill {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  due_day: number;
  category_id: number | null;
  category_name?: string;
  category_color?: string;
  is_recurring: boolean;
  reminder_days_before: number;
  is_active: boolean;
  last_reminder_date: string | null;
  last_paid_date: string | null;
  created_at: string;
}

export async function getBills(): Promise<{ bills: Bill[]; total: number }> {
  const response = await api.get<ApiResponse<{ bills: Bill[]; total: number }>>('/bills');
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar contas');
  }
  return response.data.data;
}

export async function getBillById(id: number): Promise<Bill> {
  const response = await api.get<ApiResponse<Bill>>(`/bills/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar conta');
  }
  return response.data.data;
}

export async function createBill(data: {
  name: string;
  description?: string;
  amount: number;
  due_day: number;
  category_id?: number;
  is_recurring?: boolean;
  reminder_days_before?: number;
}): Promise<{ id: number }> {
  const response = await api.post<ApiResponse<{ id: number }>>('/bills', data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao criar conta');
  }
  return response.data.data;
}

export async function updateBill(id: number, data: {
  name?: string;
  description?: string;
  amount?: number;
  due_day?: number;
  category_id?: number;
  is_recurring?: boolean;
  reminder_days_before?: number;
}): Promise<void> {
  const response = await api.put<ApiResponse<void>>(`/bills/${id}`, data);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro ao atualizar conta');
  }
}

export async function deleteBill(id: number): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(`/bills/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro ao excluir conta');
  }
}

export async function markBillAsPaid(id: number, date?: string): Promise<void> {
  const response = await api.post<ApiResponse<void>>(`/bills/${id}/pay`, { date });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro ao marcar conta como paga');
  }
}

export async function getUpcomingBills(days: number = 7): Promise<Bill[]> {
  const response = await api.get<ApiResponse<Bill[]>>('/bills/upcoming', { params: { days } });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Erro ao carregar contas proximas');
  }
  return response.data.data;
}

export default api;
