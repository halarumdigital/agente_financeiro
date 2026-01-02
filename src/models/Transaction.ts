import { query } from '../config/database';
import { ResultSetHeader } from 'mysql2';

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  category_id: number;
  date: Date;
  notes: string | null;
  source: string;
  telegram_message_id: number | null;
  is_recurring: boolean;
  recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionDTO {
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  category_id: number;
  date: string;
  notes?: string;
  source?: string;
  telegram_message_id?: number;
}

export async function createTransaction(data: CreateTransactionDTO): Promise<number> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO transactions (type, amount, description, category_id, date, notes, source, telegram_message_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.type,
      data.amount,
      data.description || null,
      data.category_id,
      data.date,
      data.notes || null,
      data.source || 'manual',
      data.telegram_message_id || null,
    ]
  );
  return result.insertId;
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const rows = await query<Transaction[]>('SELECT * FROM transactions WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function getTransactions(filters?: {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  category_id?: number;
  limit?: number;
}): Promise<Transaction[]> {
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];

  if (filters?.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters?.startDate) {
    sql += ' AND date >= ?';
    params.push(filters.startDate);
  }

  if (filters?.endDate) {
    sql += ' AND date <= ?';
    params.push(filters.endDate);
  }

  if (filters?.category_id) {
    sql += ' AND category_id = ?';
    params.push(filters.category_id);
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  if (filters?.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  return query<Transaction[]>(sql, params);
}

export async function getMonthSummary(year: number, month: number): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const incomeResult = await query<{ total: number }[]>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const expenseResult = await query<{ total: number }[]>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const income = Number(incomeResult[0]?.total || 0);
  const expense = Number(expenseResult[0]?.total || 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getRecentTransactions(limit: number = 10): Promise<(Transaction & { category_name: string })[]> {
  return query<(Transaction & { category_name: string })[]>(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getDateRangeSummary(startDate: string, endDate: string): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  const incomeResult = await query<{ total: number }[]>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const expenseResult = await query<{ total: number }[]>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const income = Number(incomeResult[0]?.total || 0);
  const expense = Number(expenseResult[0]?.total || 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function getRecentTransactionsByDateRange(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<(Transaction & { category_name: string })[]> {
  return query<(Transaction & { category_name: string })[]>(
    `SELECT t.*, c.name as category_name
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.date BETWEEN ? AND ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [startDate, endDate, limit]
  );
}
