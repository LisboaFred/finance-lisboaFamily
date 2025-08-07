import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryStat, Category } from '../../types/index';
import { formatMoney } from '../../utils/format';

interface Props {
  pieData: CategoryStat[];
  getCategory: (id: string) => Category | undefined;
}

export function CategoryPieChart({ pieData, getCategory }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center min-h-[350px]">
      <h3 className="font-bold mb-8 text-lg">Gastos por Categoria</h3>
      <PieChart width={360} height={360}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
        >
          {pieData.map(entry => (
            <Cell
              key={entry.category}
              fill={getCategory(entry.category)?.color || '#8884d8'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any, props: any) => {
            const categoryName = getCategory(props.payload.category)?.name || props.payload.category;
            return [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, categoryName];
          }}
        />
      </PieChart>
      <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-6 w-full">
        {pieData.map(cat => {
          const c = getCategory(cat.category);
          return (
            <div key={cat.category} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-200"
                style={{ backgroundColor: c?.color || '#8884d8' }}
              />
              <span>{c?.name}</span>
              <span className="ml-auto font-semibold">{formatMoney(cat.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
