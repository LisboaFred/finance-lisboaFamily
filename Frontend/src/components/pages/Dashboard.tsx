import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import api from '../../services/api';
import NewTransactionModal from '../NewTransactionModal';

interface Category {
  _id: string;
  name: string;
  color?: string;
}
interface CategoryStat {
  category: string;
  value: number;
}
interface HistoryPoint {
  month: string;
  amount: number;
}
interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  byCategory: CategoryStat[];
  history: HistoryPoint[];
}
interface RecentTx {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status?: string;
}

const periodOptions = [
  { label: 'Hoje', value: 'today' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mês', value: 'month' },
  { label: 'Este ano', value: 'year' },
];

const categoryIcons: Record<string, string> = {
  Moradia: '🏠', Alimentação: '🍔', Transporte: '🚗', Lazer: '🎉', Saúde: '💊', Outros: '📦', Receita: '💸'
};

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function statusClass(status: string) {
  if (status === 'Concluído') return 'bg-green-100 text-green-800';
  if (status === 'Pendente') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-600';
}
