import React from 'react';
import { DashboardStats } from '../../types/index';
import { formatMoney } from '../../utils/format';

interface Props {
  stats: DashboardStats;
}

export function DashboardCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-8 mb-10">
      <div className="bg-white rounded-2xl shadow p-8 flex items-center gap-6 min-h-[120px]">
        <span className="text-3xl bg-blue-100 rounded-full p-3">💰</span>
        <div>
          <div className="text-gray-400 font-medium">Saldo Atual</div>
          <div className="text-2xl font-bold">{formatMoney(stats.balance)}</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 flex items-center gap-6 min-h-[120px]">
        <span className="text-3xl bg-green-100 rounded-full p-3">⬆️</span>
        <div>
          <div className="text-gray-400 font-medium">Receitas</div>
          <div className="text-2xl font-bold text-green-600">{formatMoney(stats.totalIncome)}</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 flex items-center gap-6 min-h-[120px]">
        <span className="text-3xl bg-red-100 rounded-full p-3">⬇️</span>
        <div>
          <div className="text-gray-400 font-medium">Despesas</div>
          <div className="text-2xl font-bold text-red-500">{formatMoney(stats.totalExpense)}</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 flex items-center gap-6 min-h-[120px]">
        <span className="text-3xl bg-orange-100 rounded-full p-3">🟧</span>
        <div>
          <div className="text-gray-400 font-medium">Economia</div>
          <div className="text-2xl font-bold text-orange-500">
            {stats.savingsPercent?.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
