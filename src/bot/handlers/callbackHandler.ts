import TelegramBot from 'node-telegram-bot-api';
import {
  confirmTransaction,
  clearPendingTransaction,
  getPendingTransaction,
} from './messageHandler';
import {
  handleBalance,
  handleSummary,
  handleRecentTransactions,
  handleCategories,
  handleListSavingsBoxes,
  handleListBills,
} from './commandHandler';
import { formatCurrency } from '../../utils/formatters';
import { handleBillCallback } from '../../services/billScheduler';

export async function handleCallback(
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery
): Promise<void> {
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data;

  if (!chatId || !messageId || !data) return;

  // Trata callbacks de contas a pagar
  if (data.startsWith('bill_')) {
    const handled = await handleBillCallback(bot, callbackQuery);
    if (handled) return;
  }

  // Responde ao callback para remover o "loading"
  await bot.answerCallbackQuery(callbackQuery.id);

  // Trata confirmacao de transacao
  if (data === 'confirm' || data.startsWith('confirm_')) {
    // Pega o pending ANTES de confirmar (pois confirmTransaction limpa)
    const pending = getPendingTransaction(chatId);
    const amount = pending?.parsed.amount || 0;
    const description = pending?.parsed.description || '';

    const success = await confirmTransaction(bot, chatId);

    if (success) {
      await bot.editMessageText(
        `✅ *Transacao registrada com sucesso!*\n\n💰 ${formatCurrency(amount)}\n📝 ${description}`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
        }
      );
    } else {
      await bot.editMessageText('❌ Erro ao registrar transacao. Tente novamente.', {
        chat_id: chatId,
        message_id: messageId,
      });
    }
    return;
  }

  // Trata cancelamento
  if (data === 'cancel' || data.startsWith('cancel_')) {
    clearPendingTransaction(chatId);
    await bot.editMessageText('❌ Transacao cancelada.', {
      chat_id: chatId,
      message_id: messageId,
    });
    return;
  }

  // Trata edicao (por enquanto apenas cancela e pede nova mensagem)
  if (data === 'edit') {
    clearPendingTransaction(chatId);
    await bot.editMessageText(
      '✏️ Lancamento cancelado.\n\nEnvie a mensagem novamente com os dados corretos.',
      {
        chat_id: chatId,
        message_id: messageId,
      }
    );
    return;
  }

  // Trata opcoes do menu principal
  if (data === 'menu_saldo') {
    await handleBalance(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }

  if (data === 'menu_resumo') {
    await handleSummary(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }

  if (data === 'menu_ultimas') {
    await handleRecentTransactions(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }

  if (data === 'menu_categorias') {
    await handleCategories(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }

  if (data === 'menu_caixinhas') {
    await handleListSavingsBoxes(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }

  if (data === 'menu_contas') {
    await handleListBills(bot, { chat: { id: chatId } } as TelegramBot.Message);
    return;
  }
}
