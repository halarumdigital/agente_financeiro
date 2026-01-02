import TelegramBot from 'node-telegram-bot-api';
import {
  getAllBills,
  getBillById,
  updateLastReminderDate,
  markBillAsPaid,
  type BillWithCategory,
} from '../models/Bill';
import { createTransaction } from '../models/Transaction';
import { env } from '../config/env';

let schedulerInterval: NodeJS.Timeout | null = null;

// Armazena bills pendentes de confirmacao de pagamento
const pendingPaymentConfirmations: Map<
  number,
  { billId: number; messageId: number; chatId: number }
> = new Map();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function sendBillReminder(
  bot: TelegramBot,
  chatId: number,
  bill: BillWithCategory,
  daysUntilDue: number
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  let message: string;
  if (daysUntilDue === 0) {
    message = `🔔 *CONTA VENCE HOJE!*\n\n`;
  } else if (daysUntilDue === 1) {
    message = `⚠️ *Lembrete: Conta vence amanha!*\n\n`;
  } else {
    message = `📅 *Lembrete de conta a pagar*\n\n`;
  }

  message += `📝 *${bill.name}*\n`;
  message += `💰 Valor: *${formatCurrency(bill.amount)}*\n`;
  message += `📅 Vencimento: dia *${bill.due_day}*\n`;
  if (bill.category_name) {
    message += `🏷️ Categoria: ${bill.category_name}\n`;
  }
  if (bill.description) {
    message += `📋 ${bill.description}\n`;
  }

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Ja paguei', callback_data: `bill_paid:${bill.id}` },
        { text: '⏰ Lembrar depois', callback_data: `bill_snooze:${bill.id}` },
      ],
    ],
  };

  try {
    const sentMessage = await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    // Armazena para callback
    pendingPaymentConfirmations.set(bill.id, {
      billId: bill.id,
      messageId: sentMessage.message_id,
      chatId: chatId,
    });

    // Atualiza data do ultimo lembrete
    await updateLastReminderDate(bill.id, today);
  } catch (error) {
    console.error(`Erro ao enviar lembrete da conta ${bill.name}:`, error);
  }
}

export async function checkAndSendReminders(bot: TelegramBot): Promise<void> {
  const chatId = env.telegram.chatId;
  if (!chatId) {
    console.warn('Chat ID do Telegram nao configurado');
    return;
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();

  try {
    const bills = await getAllBills();

    for (const bill of bills) {
      // Calcula quantos dias ate o vencimento
      let daysUntilDue: number;

      if (bill.due_day >= currentDay) {
        daysUntilDue = bill.due_day - currentDay;
      } else {
        // Vencimento no proximo mes
        daysUntilDue = lastDayOfMonth - currentDay + bill.due_day;
      }

      // Verifica se ja enviou lembrete hoje
      if (bill.last_reminder_date === todayStr) {
        continue;
      }

      // Verifica se ja pagou este mes
      if (bill.last_paid_date) {
        const paidDate = new Date(bill.last_paid_date);
        if (
          paidDate.getMonth() + 1 === currentMonth &&
          paidDate.getFullYear() === currentYear
        ) {
          continue; // Ja pagou este mes
        }
      }

      // Envia lembrete 1 dia antes ou no dia do vencimento
      if (daysUntilDue === 1 || daysUntilDue === 0) {
        await sendBillReminder(bot, Number(chatId), bill, daysUntilDue);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar contas para lembrete:', error);
  }
}

export async function handleBillCallback(
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery
): Promise<boolean> {
  const data = callbackQuery.data;
  if (!data?.startsWith('bill_')) return false;

  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;

  if (!chatId || !messageId) return false;

  const [action, billIdStr] = data.split(':');
  const billId = parseInt(billIdStr, 10);

  if (isNaN(billId)) return false;

  const bill = await getBillById(billId);
  if (!bill) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Conta nao encontrada',
      show_alert: true,
    });
    return true;
  }

  if (action === 'bill_paid') {
    // Marca como paga
    const today = new Date().toISOString().split('T')[0];
    await markBillAsPaid(billId, today);

    // Cria transacao de despesa
    try {
      await createTransaction({
        type: 'expense',
        amount: bill.amount,
        description: bill.name,
        category_id: bill.category_id || 8, // 8 = categoria "Contas" (default)
        date: today,
        notes: `Pagamento automatico - ${bill.description || ''}`,
        source: 'bill_payment',
      });

      await bot.editMessageText(
        `✅ *Conta paga!*\n\n` +
          `📝 ${bill.name}\n` +
          `💰 ${formatCurrency(bill.amount)}\n\n` +
          `_Lancado como despesa automaticamente._`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      await bot.editMessageText(
        `✅ Conta marcada como paga, mas houve erro ao lancar despesa.`,
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
    }

    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Pagamento registrado!',
    });

    // Remove do mapa de pendentes
    pendingPaymentConfirmations.delete(billId);
  } else if (action === 'bill_snooze') {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: 'Ok, vou lembrar novamente amanha!',
    });

    await bot.editMessageText(
      `⏰ *Lembrete adiado*\n\n` +
        `📝 ${bill.name}\n` +
        `💰 ${formatCurrency(bill.amount)}\n` +
        `📅 Vence dia ${bill.due_day}\n\n` +
        `_Vou lembrar novamente amanha._`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
      }
    );

    // Reseta a data de lembrete para enviar novamente amanha
    await updateLastReminderDate(
      billId,
      new Date(Date.now() - 86400000).toISOString().split('T')[0]
    );
  }

  return true;
}

export function startBillScheduler(bot: TelegramBot): void {
  // Executa verificacao imediatamente
  checkAndSendReminders(bot);

  // Depois executa a cada hora
  schedulerInterval = setInterval(
    () => {
      const now = new Date();
      // Executa apenas as 9h e as 18h
      if (now.getHours() === 9 || now.getHours() === 18) {
        checkAndSendReminders(bot);
      }
    },
    60 * 60 * 1000
  ); // A cada hora

  console.log('📅 Scheduler de contas a pagar iniciado');
}

export function stopBillScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('Scheduler de contas parado');
  }
}
