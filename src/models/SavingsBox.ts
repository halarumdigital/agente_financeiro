import { query } from '../config/database';
import { ResultSetHeader } from 'mysql2';

export interface SavingsBox {
  id: number;
  name: string;
  description: string | null;
  goal_amount: number;
  current_amount: number;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SavingsBoxTransaction {
  id: number;
  savings_box_id: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  description: string | null;
  date: string;
  created_at: Date;
}

export async function getAllSavingsBoxes(): Promise<SavingsBox[]> {
  return query<SavingsBox[]>('SELECT * FROM savings_boxes WHERE is_active = true ORDER BY name');
}

export async function getSavingsBoxById(id: number): Promise<SavingsBox | null> {
  const rows = await query<SavingsBox[]>('SELECT * FROM savings_boxes WHERE id = ? AND is_active = true', [id]);
  return rows[0] || null;
}

export async function getSavingsBoxByName(name: string): Promise<SavingsBox | null> {
  const rows = await query<SavingsBox[]>(
    'SELECT * FROM savings_boxes WHERE UPPER(name) = UPPER(?) AND is_active = true',
    [name]
  );
  return rows[0] || null;
}

export async function createSavingsBox(data: {
  name: string;
  description?: string;
  goal_amount?: number;
  icon?: string;
  color?: string;
}): Promise<number> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO savings_boxes (name, description, goal_amount, icon, color)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description || null,
      data.goal_amount || 0,
      data.icon || 'piggy-bank',
      data.color || '#22C55E',
    ]
  );
  return result.insertId;
}

export async function updateSavingsBoxAmount(id: number, amount: number): Promise<void> {
  await query('UPDATE savings_boxes SET current_amount = ? WHERE id = ?', [amount, id]);
}

export async function deposit(boxId: number, amount: number, description?: string): Promise<void> {
  const box = await getSavingsBoxById(boxId);
  if (!box) throw new Error('Caixinha nao encontrada');

  const newAmount = Number(box.current_amount) + amount;
  const today = new Date().toISOString().split('T')[0];

  // Atualiza saldo da caixinha
  await query('UPDATE savings_boxes SET current_amount = ? WHERE id = ?', [newAmount, boxId]);

  // Registra transacao
  await query(
    `INSERT INTO savings_box_transactions (savings_box_id, type, amount, description, date)
     VALUES (?, 'deposit', ?, ?, ?)`,
    [boxId, amount, description || 'Deposito', today]
  );
}

export async function withdraw(boxId: number, amount: number, description?: string): Promise<void> {
  const box = await getSavingsBoxById(boxId);
  if (!box) throw new Error('Caixinha nao encontrada');

  if (Number(box.current_amount) < amount) {
    throw new Error('Saldo insuficiente na caixinha');
  }

  const newAmount = Number(box.current_amount) - amount;
  const today = new Date().toISOString().split('T')[0];

  // Atualiza saldo da caixinha
  await query('UPDATE savings_boxes SET current_amount = ? WHERE id = ?', [newAmount, boxId]);

  // Registra transacao
  await query(
    `INSERT INTO savings_box_transactions (savings_box_id, type, amount, description, date)
     VALUES (?, 'withdraw', ?, ?, ?)`,
    [boxId, amount, description || 'Retirada', today]
  );
}

export async function getBoxTransactions(boxId: number, limit: number = 10): Promise<SavingsBoxTransaction[]> {
  return query<SavingsBoxTransaction[]>(
    `SELECT * FROM savings_box_transactions
     WHERE savings_box_id = ?
     ORDER BY date DESC, created_at DESC
     LIMIT ?`,
    [boxId, limit]
  );
}

export async function deleteSavingsBox(id: number): Promise<void> {
  await query('UPDATE savings_boxes SET is_active = false WHERE id = ?', [id]);
}

export async function getTotalSaved(): Promise<number> {
  const result = await query<{ total: number }[]>(
    'SELECT COALESCE(SUM(current_amount), 0) as total FROM savings_boxes WHERE is_active = true'
  );
  return Number(result[0]?.total || 0);
}
