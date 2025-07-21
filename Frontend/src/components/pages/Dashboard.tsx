import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import api from '../../services/api';
import NewTransactionModal from '../NewTransactionModal';
import { useNavigate } from 'react-router-dom';

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
  const [selectedTx, setSelectedTx] = useState<RecentTx | null>(null);

  const navigate = useNavigate();

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

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  function handleDelete(id: string) {
    api.delete(`/transactions/${id}`)
      .then(() => {
        setReload(r => r + 1);
        setSelectedTx(null);
      })
      .catch(() => alert('Erro ao excluir'));
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <div className="w-full flex justify-end px-10 py-4">
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 font-semibold hover:underline"
        >
          Sair
        </button>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-10">
        <div className="flex flex-wrap gap-4 mb-8">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-5 py-3 rounded-lg font-semibold transition ${period === opt.value ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border hover:bg-blue-50'}`}
            >
              {opt.label}
            </button>
          ))}
          <input type="date" onChange={e => { setPeriod('custom'); setStartDate(e.target.value); }} className="border rounded px-3 py-2" />
          <span className="px-1">até</span>
          <input type="date" onChange={e => { setPeriod('custom'); setEndDate(e.target.value); }} className="border rounded px-3 py-2" />
        </div>

        {stats && (
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
                <div className="text-2xl font-bold text-orange-500">{formatMoney(stats.savings)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center min-h-[350px]">
            <h3 className="font-bold mb-8 text-lg">Gastos por Categoria</h3>
            {stats && (
              <PieChart width={360} height={360}>
                <Pie
                  data={stats.byCategory}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {stats.byCategory.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={getCategory(entry.category)?.color || '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
            {stats && (
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-6 w-full">
                {stats.byCategory.map((cat) => {
                  const c = getCategory(cat.category);
                  return (
                    <div key={cat.category} className="flex items-center gap-2">
                      <span className="text-xl" style={{ color: c?.color }}>{categoryIcons[c?.name || 'Outros']}</span>
                      <span>{c?.name}</span>
                      <span className="ml-auto font-semibold">{formatMoney(cat.value)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow p-10 overflow-x-auto min-h-[350px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-center mb-6">Transações Recentes</h3>
              <table className="w-full text-base">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left whitespace-nowrap">Categoria</th>
                    <th className="text-left whitespace-nowrap">Data</th>
                    <th className="text-center whitespace-nowrap">Valor</th>
                    <th className="text-center whitespace-nowrap">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(tx => {
                    const c = getCategory(tx.category);
                    return (
                      <tr key={tx._id} className="border-b last:border-b-0">
                        <td className="py-3 flex items-center gap-2 font-semibold max-w-[160px] truncate">
                          <span className="text-lg">{categoryIcons[c?.name || 'Outros']}</span>
                          <span>{c?.name || tx.category}</span>
                        </td>
                        <td className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                        <td className={`text-right font-bold pr-6 min-w-[120px] ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                        </td>
                        <td className="text-center pl-2 min-w-[40px]">
                          <button onClick={() => setSelectedTx(tx)} className="text-red-500 hover:text-red-700 text-xl">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <a href="#" className="text-blue-500 text-sm font-medium hover:underline">Ver todas</a>
            </div>
          </div>
        </div>

        {selectedTx && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md text-center">
              <h2 className="text-lg font-bold mb-4">Confirmar</h2>
              <p className="mb-6">Deseja realmente excluir essa transação?</p>
              <div className="flex justify-around gap-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => handleDelete(selectedTx._id)}
                >
                  Excluir
                </button>
                <button
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setSelectedTx(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-12">
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow hover:bg-blue-700 transition text-lg"
            onClick={() => setModalOpen(true)}
          >
            + Registrar Nova Transação
          </button>
        </div>

        {modalOpen && (
          <NewTransactionModal
            onClose={() => setModalOpen(false)}
            onSuccess={() => setReload(r => r + 1)}
          />
        )}
      </div>
    </div>
  );
}
