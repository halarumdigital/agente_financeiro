import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import {
  getReportsByCategory,
  getReportsByPeriod,
  getReportsTransactions,
  getReportsSummary,
  type CategoryReport,
  type PeriodReport,
  type ReportsSummary,
} from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type DatePreset = 'thisMonth' | 'lastMonth' | 'last7Days' | 'last30Days' | 'last90Days' | 'thisYear' | 'custom';

interface TransactionItem {
  id: number;
  type: string;
  amount: number;
  description: string;
  date: string;
  category_id: number;
  category_name: string;
  category_color: string;
}

export default function Reports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<CategoryReport[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryReport[]>([]);
  const [periodData, setPeriodData] = useState<PeriodReport[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (datePreset) {
      case 'thisMonth': {
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return {
          startDate: `${year}-${String(month).padStart(2, '0')}-01`,
          endDate: new Date(year, month, 0).toISOString().split('T')[0],
        };
      }
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const year = lastMonth.getFullYear();
        const month = lastMonth.getMonth() + 1;
        return {
          startDate: `${year}-${String(month).padStart(2, '0')}-01`,
          endDate: new Date(year, month, 0).toISOString().split('T')[0],
        };
      }
      case 'last7Days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today,
        };
      }
      case 'last30Days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today,
        };
      }
      case 'last90Days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 89);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today,
        };
      }
      case 'thisYear': {
        const year = now.getFullYear();
        return {
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };
      }
      case 'custom':
        return {
          startDate: customStartDate || today,
          endDate: customEndDate || today,
        };
      default:
        return { startDate: today, endDate: today };
    }
  }, [datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const params = { startDate, endDate };

      const [summaryData, expenseData, incomeData, periodDataResult, transactionsData] = await Promise.all([
        getReportsSummary(params),
        getReportsByCategory({ ...params, type: 'expense' }),
        getReportsByCategory({ ...params, type: 'income' }),
        getReportsByPeriod({ ...params, groupBy: 'day' }),
        getReportsTransactions({ ...params, limit: 10, offset: 0 }),
      ]);

      setSummary(summaryData);
      setExpenseCategories(expenseData.categories);
      setIncomeCategories(incomeData.categories);
      setPeriodData(periodDataResult);
      setTransactions(transactionsData.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatorio');
    } finally {
      setLoading(false);
    }
  }

  const datePresets = [
    { value: 'thisMonth' as DatePreset, label: 'Este Mes' },
    { value: 'lastMonth' as DatePreset, label: 'Mes Passado' },
    { value: 'last7Days' as DatePreset, label: 'Ultimos 7 dias' },
    { value: 'last30Days' as DatePreset, label: 'Ultimos 30 dias' },
    { value: 'last90Days' as DatePreset, label: 'Ultimos 90 dias' },
    { value: 'thisYear' as DatePreset, label: 'Este Ano' },
    { value: 'custom' as DatePreset, label: 'Personalizado' },
  ];

  const dailyAverage = summary && summary.daysInPeriod > 0
    ? (summary.income.total - summary.expense.total) / summary.daysInPeriod
    : 0;

  return (
    <Layout title="Relatorios">
      <div className="space-y-6">
        {/* Date Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Periodo:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {datePresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>

              {datePreset === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">ate</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500 ml-auto">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-100 text-sm font-medium">Receitas</span>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.income.total)}</p>
                <p className="text-green-100 text-sm mt-1">{summary.income.count} transacoes</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-red-100 text-sm font-medium">Despesas</span>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.expense.total)}</p>
                <p className="text-red-100 text-sm mt-1">{summary.expense.count} transacoes</p>
              </div>

              <div className={`bg-gradient-to-br ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl shadow-sm p-5 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/80 text-sm font-medium">Saldo do Periodo</span>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
                <p className="text-white/80 text-sm mt-1">{summary.daysInPeriod} dias</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-purple-100 text-sm font-medium">Media Diaria</span>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(dailyAverage)}</p>
                <p className="text-purple-100 text-sm mt-1">saldo/dia</p>
              </div>
            </div>

            {/* Evolution Chart */}
            {periodData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolucao Diaria</h3>
                <div className="h-64 flex items-end gap-1 overflow-x-auto pb-2">
                  {periodData.slice(-30).map((period, idx) => {
                    const maxValue = Math.max(...periodData.slice(-30).map(p => Math.max(p.income, p.expense)));
                    const incomeHeight = maxValue > 0 ? (period.income / maxValue) * 100 : 0;
                    const expenseHeight = maxValue > 0 ? (period.expense / maxValue) * 100 : 0;

                    return (
                      <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end h-48">
                          <div
                            className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
                            style={{ height: `${incomeHeight}%`, minHeight: period.income > 0 ? '4px' : '0' }}
                            title={`Receita: ${formatCurrency(period.income)}`}
                          />
                          <div
                            className="flex-1 bg-red-500 rounded-t transition-all hover:bg-red-600"
                            style={{ height: `${expenseHeight}%`, minHeight: period.expense > 0 ? '4px' : '0' }}
                            title={`Despesa: ${formatCurrency(period.expense)}`}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 truncate max-w-full" title={period.period}>
                          {period.period.slice(8)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm text-gray-600">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-sm text-gray-600">Despesas</span>
                  </div>
                </div>
              </div>
            )}

            {/* Categories - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Despesas por Categoria</h3>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(summary.expense.total)}</span>
                </div>
                {expenseCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma despesa no periodo</p>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories.slice(0, 6).map((cat) => (
                      <div key={cat.category_id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat.color || '#6b7280' }}
                            />
                            <span className="font-medium text-gray-700">{cat.category}</span>
                          </span>
                          <span className="text-gray-600">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color || '#ef4444',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Income Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Receitas por Categoria</h3>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(summary.income.total)}</span>
                </div>
                {incomeCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma receita no periodo</p>
                ) : (
                  <div className="space-y-3">
                    {incomeCategories.slice(0, 6).map((cat) => (
                      <div key={cat.category_id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat.color || '#6b7280' }}
                            />
                            <span className="font-medium text-gray-700">{cat.category}</span>
                          </span>
                          <span className="text-gray-600">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color || '#22c55e',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Biggest Income */}
              {summary.income.biggest && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-500">Maior Receita</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(summary.income.biggest.amount)}</p>
                  <p className="text-sm text-gray-700 mt-1 truncate">
                    {summary.income.biggest.description || summary.income.biggest.category_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(summary.income.biggest.date)}</p>
                </div>
              )}

              {/* Biggest Expense */}
              {summary.expense.biggest && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-500">Maior Despesa</span>
                  </div>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(summary.expense.biggest.amount)}</p>
                  <p className="text-sm text-gray-700 mt-1 truncate">
                    {summary.expense.biggest.description || summary.expense.biggest.category_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(summary.expense.biggest.date)}</p>
                </div>
              )}

              {/* Top Category */}
              {summary.expense.topCategory && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: summary.expense.topCategory.color }}
                    />
                    <span className="text-sm font-medium text-gray-500">Categoria + Gasta</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: summary.expense.topCategory.color }}>
                    {summary.expense.topCategory.category}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatCurrency(summary.expense.topCategory.total)}
                  </p>
                </div>
              )}
            </div>

            {/* Averages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Media por Transacao - Receitas</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income.average)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Media por Transacao - Despesas</h4>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense.average)}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Ultimas Transacoes</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.description || tx.category_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${tx.category_color}20`,
                            color: tx.category_color,
                          }}
                        >
                          {tx.category_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
