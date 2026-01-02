import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance' | 'total';
  subtitle?: string;
}

export default function BalanceCard({ title, value, type, subtitle }: BalanceCardProps) {
  const config = {
    income: {
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
      textColor: 'text-green-600',
    },
    expense: {
      icon: TrendingDown,
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-500',
      textColor: 'text-red-600',
    },
    balance: {
      icon: Wallet,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: value >= 0 ? 'text-blue-600' : 'text-red-600',
    },
    total: {
      icon: PiggyBank,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  };

  const { icon: Icon, bgColor, iconBg, textColor } = config[type];

  return (
    <div className={`${bgColor} rounded-xl p-6 border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${textColor}`}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
