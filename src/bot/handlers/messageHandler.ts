import TelegramBot from 'node-telegram-bot-api';
import { parseTransactionMessage, isTransactionMessage, ParsedTransaction } from '../../services/aiService';
import { findBestCategoryMatch } from '../../models/Category';
import { createTransaction } from '../../models/Transaction';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getConfirmTransactionKeyboard } from '../keyboards/inlineKeyboards';

// Armazena transacoes pendentes de confirmacao (compartilhado com mediaHandler)
const pendingTransactions = new Map<number, {
  parsed: ParsedTransaction;
  categoryId: number;
  messageId: number;
}>();

export function getPendingTransaction(chatId: number) {
  return pendingTransactions.get(chatId);
}

export function clearPendingTransaction(chatId: number) {
  pendingTransactions.delete(chatId);
}

export function setPendingTransaction(chatId: number, data: {
  parsed: ParsedTransaction;
  categoryId: number;
  messageId: number;
}) {
  pendingTransactions.set(chatId, data);
}

export async function handleMessage(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // Ignora comandos (sao tratados separadamente)
  if (text.startsWith('/')) return;

  // Verifica se parece ser uma transacao
  const looksLikeTransaction = await isTransactionMessage(text);

  if (!looksLikeTransaction) {
    await bot.sendMessage(
      chatId,
      '🤔 Nao entendi sua mensagem.\n\nEnvie algo como:\n• "gastei 50 no almoco"\n• "recebi 1000 de freelance"\n\nOu use /ajuda para ver os comandos.'
    );
    return;
  }

  // Envia mensagem de "digitando"
  await bot.sendChatAction(chatId, 'typing');

  try {
    // Usa IA para interpretar a mensagem
    const parsed = await parseTransactionMessage(text);

    if (!parsed) {
      await bot.sendMessage(
        chatId,
        '❌ Nao consegui interpretar sua mensagem.\n\nTente ser mais especifico, por exemplo:\n• "gastei 150 no mercado"\n• "recebi 5000 de salario"'
      );
      return;
    }

    // Busca a categoria correspondente
    const category = await findBestCategoryMatch(parsed.category, parsed.type);

    if (!category) {
      await bot.sendMessage(chatId, '❌ Categoria nao encontrada. Tente novamente.');
      return;
    }

    // Formata a mensagem de confirmacao
    const typeLabel = parsed.type === 'income' ? 'Receita' : 'Despesa';
    const typeIcon = parsed.type === 'income' ? '📈' : '📉';

    const confirmMessage = `
✅ Entendi! Confirma o lancamento?

${typeIcon} *${typeLabel}:* ${formatCurrency(parsed.amount)}
📁 *Categoria:* ${category.name}
📝 *${parsed.description}*
📅 *Data:* ${formatDate(parsed.date)}
`;

    const sentMsg = await bot.sendMessage(chatId, confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmTransactionKeyboard(),
    });

    // Armazena a transacao pendente
    pendingTransactions.set(chatId, {
      parsed,
      categoryId: category.id,
      messageId: sentMsg.message_id,
    });

  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    await bot.sendMessage(chatId, '❌ Ocorreu um erro. Tente novamente.');
  }
}

export async function confirmTransaction(bot: TelegramBot, chatId: number): Promise<boolean> {
  const pending = pendingTransactions.get(chatId);

  if (!pending) {
    return false;
  }

  try {
    // Cria a transacao no banco
    const transactionId = await createTransaction({
      type: pending.parsed.type,
      amount: pending.parsed.amount,
      description: pending.parsed.description,
      category_id: pending.categoryId,
      date: pending.parsed.date,
      source: 'telegram',
    });

    // Limpa a transacao pendente
    pendingTransactions.delete(chatId);

    return true;
  } catch (error) {
    console.error('Erro ao salvar transacao:', error);
    return false;
  }
}
