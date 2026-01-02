import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

async function runMigrations(): Promise<void> {
  console.log('🚀 Iniciando migracoes do banco de dados...\n');

  // Cria conexao com multipleStatements habilitado
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  console.log('✅ Conectado ao MySQL\n');

  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    // Executa todo o schema de uma vez
    await connection.query(schema);
    console.log('✅ Tabela categories criada');
    console.log('✅ Tabela transactions criada');
    console.log('✅ Tabela budgets criada');
    console.log('✅ Tabela investments criada');
    console.log('✅ Tabela investment_transactions criada');
    console.log('✅ Tabela cash_accounts criada');
    console.log('✅ Tabela alerts criada');
    console.log('✅ Tabela settings criada');
    console.log('✅ Dados iniciais inseridos');
  } catch (error: any) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️  Tabelas ja existem');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }

  console.log('\n✅ Migracoes concluidas!');

  await connection.end();
}

runMigrations().catch((error) => {
  console.error('Erro fatal nas migracoes:', error);
  process.exit(1);
});
