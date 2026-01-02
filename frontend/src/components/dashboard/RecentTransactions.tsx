import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import type { Transaction } from '../../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Ultimas Transacoes</h3>
        <div className="text-center text-gray-400 py-8">
          Nenhuma transacao ainda
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Ultimas Transacoes</h3>
        <a href="/transacoes" className="text-sm text-green-600 hover:text-green-700">
          Ver todas
        </a>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {transaction.description || transaction.category_name}
                </p>
                <p className="text-xs text-gray-400">
                  {transaction.category_name} • {formatDateShort(transaction.date)}
                </p>
              </div>
            </div>
            <p
              className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
