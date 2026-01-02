import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';
import {
  handleStart,
  handleHelp,
  handleBalance,
  handleSummary,
  handleRecentTransactions,
  handleCategories,
  handleListSavingsBoxes,
  handleSavingsBoxCommand,
  handleListBills,
  handleBillCommand,
} from './handlers/commandHandler';
import { handleMessage } from './handlers/messageHandler';
import { handleCallback } from './handlers/callbackHandler';
import { handleVoiceMessage, handlePhotoMessage } from './handlers/mediaHandler';
import { startBillScheduler, stopBillScheduler } from '../services/billScheduler';

let bot: TelegramBot | null = null;

// Verifica se a mensagem é sobre caixinha
function isSavingsBoxMessage(text: string): boolean {
  const patterns = [
    /criar\s+caixinha/i,
    /(?:guardar|depositar|colocar)\s+\d+.*(?:caixinha|na\s+\w+)/i,
    /(?:retirar|tirar|sacar)\s+\d+.*(?:caixinha|da\s+\w+)/i,
    /(?:saldo\s+)?(?:da\s+)?caixinha\s+\w+/i,
  ];
  return patterns.some((p) => p.test(text));
}

// Verifica se a mensagem é sobre contas a pagar
function isBillMessage(text: string): boolean {
  const patterns = [
    /(?:criar|nova|adicionar)\s+conta/i,
    /conta\s+(?:de\s+)?\d+/i,
    /vence\s+(?:dia\s+)?\d+/i,
  ];
  return patterns.some((p) => p.test(text));
}

export function startBot(): TelegramBot | null {
  if (!env.telegram.botToken || env.telegram.botToken.startsWith('seu_')) {
    console.warn('⚠️  Token do Telegram nao configurado. Bot desativado.');
    return null;
  }

  bot = new TelegramBot(env.telegram.botToken, { polling: true });

  console.log('🤖 Bot do Telegram iniciado!');

  // Comandos
  bot.onText(/\/start/, (msg) => handleStart(bot!, msg));
  bot.onText(/\/ajuda/, (msg) => handleHelp(bot!, msg));
  bot.onText(/\/help/, (msg) => handleHelp(bot!, msg));
  bot.onText(/\/saldo/, (msg) => handleBalance(bot!, msg));
  bot.onText(/\/resumo/, (msg) => handleSummary(bot!, msg));
  bot.onText(/\/ultimas/, (msg) => handleRecentTransactions(bot!, msg));
  bot.onText(/\/categorias/, (msg) => handleCategories(bot!, msg));
  bot.onText(/\/caixinhas/, (msg) => handleListSavingsBoxes(bot!, msg));
  bot.onText(/\/contas/, (msg) => handleListBills(bot!, msg));

  // Mensagens de texto (transacoes e caixinhas)
  bot.on('message', (msg) => {
    // Ignora mensagens que sao comandos
    if (msg.text?.startsWith('/')) return;

    // Ignora mensagens de voz e foto (tratadas em handlers separados)
    if (msg.voice || msg.photo) return;

    // Verifica se é comando de caixinha
    if (msg.text && isSavingsBoxMessage(msg.text)) {
      handleSavingsBoxCommand(bot!, msg, msg.text);
      return;
    }

    // Verifica se é comando de conta a pagar
    if (msg.text && isBillMessage(msg.text)) {
      handleBillCommand(bot!, msg, msg.text);
      return;
    }

    // Senao, trata como transacao
    handleMessage(bot!, msg);
  });

  // Mensagens de voz/audio
  bot.on('voice', (msg) => handleVoiceMessage(bot!, msg));

  // Fotos/comprovantes
  bot.on('photo', (msg) => handlePhotoMessage(bot!, msg));

  // Callbacks de botoes inline
  bot.on('callback_query', (query) => handleCallback(bot!, query));

  // Tratamento de erros
  bot.on('polling_error', (error) => {
    console.error('Erro de polling do Telegram:', error.message);
  });

  // Inicia o scheduler de contas a pagar
  startBillScheduler(bot);

  return bot;
}

export function stopBot(): void {
  if (bot) {
    stopBillScheduler();
    bot.stopPolling();
    bot = null;
    console.log('Bot do Telegram parado.');
  }
}

export function getBot(): TelegramBot | null {
  return bot;
}
