import mysql from 'mysql2/promise';
import { env } from './env';

let pool: mysql.Pool | null = null;

export async function getPool(): Promise<mysql.Pool> {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });

    // Testar conexao
    try {
      const connection = await pool.getConnection();
      console.log('✅ Conectado ao MySQL com sucesso');
      connection.release();
    } catch (error) {
      console.error('❌ Erro ao conectar ao MySQL:', error);
      throw error;
    }
  }

  return pool;
}

export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const pool = await getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Conexao MySQL encerrada');
  }
}
