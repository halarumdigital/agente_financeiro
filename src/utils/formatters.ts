export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): string {
  // Tenta interpretar datas como "ontem", "hoje", "amanha"
  const today = new Date();
  const lowerStr = dateStr.toLowerCase().trim();

  if (lowerStr === 'hoje') {
    return formatDateISO(today);
  }

  if (lowerStr === 'ontem') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateISO(yesterday);
  }

  if (lowerStr === 'amanha' || lowerStr === 'amanhã') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateISO(tomorrow);
  }

  // Tenta interpretar formato DD/MM/YYYY ou DD-MM-YYYY
  const brMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Tenta interpretar formato DD/MM (assume ano atual)
  const shortMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
  if (shortMatch) {
    const [, day, month] = shortMatch;
    return `${today.getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Se nao conseguir interpretar, retorna data atual
  return formatDateISO(today);
}
