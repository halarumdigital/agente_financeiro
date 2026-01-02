import { formatCurrency } from '../../utils/formatters';

interface DayData {
  period: string;
  income: number;
  expense: number;
  balance: number;
}

interface IncomeExpenseChartProps {
  data: DayData[];
  title?: string;
}

export default function IncomeExpenseChart({ data, title = 'Receitas vs Despesas por Dia' }: IncomeExpenseChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);

  // Formata a data para exibir apenas o dia
  const formatDay = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return parts[2]; // Retorna apenas o dia
    }
    return dateStr;
  };

  // Calcula totais
  const totals = data.reduce(
    (acc, d) => ({
      income: acc.income + d.income,
      expense: acc.expense + d.expense,
    }),
    { income: 0, expense: 0 }
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

      {/* Grafico */}
      <div className="overflow-x-auto">
        <div className="flex items-end gap-1 h-48 min-w-fit pb-6">
          {data.map((day, idx) => {
            const incomeHeight = maxValue > 0 ? (day.income / maxValue) * 100 : 0;
            const expenseHeight = maxValue > 0 ? (day.expense / maxValue) * 100 : 0;

            return (
              <div key={idx} className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '24px' }}>
                <div className="flex gap-0.5 items-end h-40">
                  {/* Barra de receita */}
                  <div
                    className="w-2.5 bg-green-500 rounded-t transition-all hover:bg-green-600 cursor-pointer"
                    style={{ height: `${incomeHeight}%`, minHeight: day.income > 0 ? '4px' : '0' }}
                    title={`${day.period}\nReceita: ${formatCurrency(day.income)}`}
                  />
                  {/* Barra de despesa */}
                  <div
                    className="w-2.5 bg-red-500 rounded-t transition-all hover:bg-red-600 cursor-pointer"
                    style={{ height: `${expenseHeight}%`, minHeight: day.expense > 0 ? '4px' : '0' }}
                    title={`${day.period}\nDespesa: ${formatCurrency(day.expense)}`}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1 rotate-0">{formatDay(day.period)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda e totais */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-600">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Despesas</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">{formatCurrency(totals.income)}</span>
          <span className="text-gray-400">|</span>
          <span className="text-red-600 font-medium">{formatCurrency(totals.expense)}</span>
        </div>
      </div>
    </div>
  );
}
