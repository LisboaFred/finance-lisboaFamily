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

export default function Dashboard() {
  const [period, setPeriod] = useState('week');
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentTx[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(0);

  // Carregar categorias
  useEffect(() => {
    api.get('/categories')
      .then(resp => setCategories(resp.data))
      .catch(() => setCategories([]));
  }, []);

  // Filtro de período
  function getFilterParams() {
    let params: any = {};
    const now = new Date();
    if (period === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      params.startDate = d.toISOString();
      d.setHours(23, 59, 59, 999);
      params.endDate = d.toISOString();
    } else if (period === 'week') {
      const d = new Date();
      const day = d.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      params.startDate = monday.toISOString();
      params.endDate = sunday.toISOString();
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'year') {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    return params;
  }

  // Carregar dashboard e transações recentes com filtro
  useEffect(() => {
    const params = getFilterParams();
    api.get('/dashboard', { params })
      .then(resp => setStats(resp.data))
      .catch(() => setStats(null));
    api.get('/dashboard/recent', { params })
      .then(resp => setRecent(resp.data))
      .catch(() => setRecent([]));
  }, [period, startDate, endDate, reload]);

  function getCategory(catId: string) {
    return categories.find(c => c._id === catId);
  }
};