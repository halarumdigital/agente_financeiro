import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'finbot',
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

export function validateEnv(): void {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key] || process.env[key]?.startsWith('seu_'));

  if (missing.length > 0) {
    console.warn(`\n⚠️  Variaveis de ambiente faltando ou nao configuradas:`);
    missing.forEach((key) => console.warn(`   - ${key}`));
    console.warn(`\n   Configure no arquivo .env antes de usar o bot.\n`);
  }
}
