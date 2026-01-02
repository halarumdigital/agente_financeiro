import TelegramBot from 'node-telegram-bot-api';

export function getConfirmTransactionKeyboard(transactionId?: string): TelegramBot.InlineKeyboardMarkup {
  const confirmData = transactionId ? `confirm_${transactionId}` : 'confirm';
  const cancelData = transactionId ? `cancel_${transactionId}` : 'cancel';

  return {
    inline_keyboard: [
      [
        { text: '✓ Confirmar', callback_data: confirmData },
        { text: '✏️ Editar', callback_data: 'edit' },
        { text: '❌ Cancelar', callback_data: cancelData },
      ],
    ],
  };
}

export function getMainMenuKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '💰 Saldo', callback_data: 'menu_saldo' },
        { text: '📊 Resumo', callback_data: 'menu_resumo' },
      ],
      [
        { text: '📝 Ultimas', callback_data: 'menu_ultimas' },
        { text: '📁 Categorias', callback_data: 'menu_categorias' },
      ],
      [
        { text: '🐷 Caixinhas', callback_data: 'menu_caixinhas' },
        { text: '🔔 Contas', callback_data: 'menu_contas' },
      ],
    ],
  };
}

export function getEditOptionsKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '💵 Valor', callback_data: 'edit_amount' },
        { text: '📁 Categoria', callback_data: 'edit_category' },
      ],
      [
        { text: '📝 Descricao', callback_data: 'edit_description' },
        { text: '📅 Data', callback_data: 'edit_date' },
      ],
      [
        { text: '🔙 Voltar', callback_data: 'back_confirm' },
      ],
    ],
  };
}

export function getCategoryKeyboard(categories: { id: number; name: string }[]): TelegramBot.InlineKeyboardMarkup {
  const buttons = categories.map((cat) => ({
    text: cat.name,
    callback_data: `cat_${cat.id}`,
  }));

  // Organiza em linhas de 2 botões
  const rows: TelegramBot.InlineKeyboardButton[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }

  rows.push([{ text: '❌ Cancelar', callback_data: 'cancel' }]);

  return { inline_keyboard: rows };
}
