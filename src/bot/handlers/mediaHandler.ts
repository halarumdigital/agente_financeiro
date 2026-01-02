import TelegramBot from 'node-telegram-bot-api';
import { transcribeAudio, parseReceiptImage, parseTransactionMessage } from '../../services/aiService';
import { findBestCategoryMatch } from '../../models/Category';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getConfirmTransactionKeyboard } from '../keyboards/inlineKeyboards';
import { setPendingTransaction } from './messageHandler';

// =====================================================
// HANDLER DE MENSAGENS DE VOZ/AUDIO
// =====================================================

export async function handleVoiceMessage(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const voice = msg.voice;

  if (!voice) return;

  // Limite de 1 minuto de audio
  if (voice.duration > 60) {
    await bot.sendMessage(chatId, '⚠️ Audio muito longo. Envie audios de ate 1 minuto.');
    return;
  }

  await bot.sendMessage(chatId, '🎤 Transcrevendo audio...');
  await bot.sendChatAction(chatId, 'typing');

  try {
    // Baixa o arquivo de audio
    const fileLink = await bot.getFileLink(voice.file_id);
    const response = await fetch(fileLink);
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Transcreve o audio
    const transcription = await transcribeAudio(audioBuffer, 'voice.ogg');

    if (!transcription) {
      await bot.sendMessage(chatId, '❌ Nao consegui transcrever o audio. Tente novamente ou envie por texto.');
      return;
    }

    await bot.sendMessage(chatId, `📝 Entendi: "${transcription}"\n\nProcessando...`);

    // Processa a transcrição como se fosse uma mensagem de texto
    const parsed = await parseTransactionMessage(transcription);

    if (!parsed) {
      await bot.sendMessage(
        chatId,
        `❌ Nao consegui identificar uma transacao no audio.\n\nVoce disse: "${transcription}"\n\nTente dizer algo como: "gastei 50 reais no mercado"`
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
🎤 *Transacao por audio*

${typeIcon} *${typeLabel}:* ${formatCurrency(parsed.amount)}
📁 *Categoria:* ${category.name}
📝 *${parsed.description}*
📅 *Data:* ${formatDate(parsed.date)}

Confirma o lancamento?
`;

    const sentMsg = await bot.sendMessage(chatId, confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmTransactionKeyboard(),
    });

    // Armazena a transacao pendente (usa o armazenamento compartilhado)
    setPendingTransaction(chatId, {
      parsed,
      categoryId: category.id,
      messageId: sentMsg.message_id,
    });

  } catch (error) {
    console.error('Erro ao processar audio:', error);
    await bot.sendMessage(chatId, '❌ Erro ao processar audio. Tente novamente.');
  }
}

// =====================================================
// HANDLER DE FOTOS/COMPROVANTES
// =====================================================

export async function handlePhotoMessage(bot: TelegramBot, msg: TelegramBot.Message): Promise<void> {
  const chatId = msg.chat.id;
  const photos = msg.photo;

  if (!photos || photos.length === 0) return;

  // Pega a foto de maior resolucao (ultima do array)
  const photo = photos[photos.length - 1];

  await bot.sendMessage(chatId, '🔍 Analisando comprovante...');
  await bot.sendChatAction(chatId, 'typing');

  try {
    // Baixa a imagem
    const fileLink = await bot.getFileLink(photo.file_id);
    const response = await fetch(fileLink);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    // Analisa a imagem com Vision
    const parsed = await parseReceiptImage(imageBase64);

    if (!parsed) {
      await bot.sendMessage(
        chatId,
        '❌ Nao consegui identificar uma transacao nesta imagem.\n\nEnvie uma foto clara de:\n• Comprovante PIX\n• Nota fiscal\n• Recibo de pagamento\n• Fatura'
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
📸 *Transacao do comprovante*

${typeIcon} *${typeLabel}:* ${formatCurrency(parsed.amount)}
📁 *Categoria:* ${category.name}
📝 *${parsed.description}*
📅 *Data:* ${formatDate(parsed.date)}

Confirma o lancamento?
`;

    const sentMsg = await bot.sendMessage(chatId, confirmMessage, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmTransactionKeyboard(),
    });

    // Armazena a transacao pendente (usa o armazenamento compartilhado)
    setPendingTransaction(chatId, {
      parsed,
      categoryId: category.id,
      messageId: sentMsg.message_id,
    });

  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    await bot.sendMessage(chatId, '❌ Erro ao processar imagem. Tente novamente.');
  }
}
