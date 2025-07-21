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

export default function Dashboard() {
  const navigate = useNavigate();

  // formatação helpers
  const pad = (n: number) => n.toString().padStart(2, '0');
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const currentDate      = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // filtros
  const [period, setPeriod]               = useState<'today' | 'month' | 'custom'>('today');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [startDate, setStartDate]         = useState<string>(currentDate);
  const [endDate, setEndDate]             = useState<string>(currentDate);

  // dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [recent, setRecent]         = useState<RecentTx[]>([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [reload, setReload]         = useState(0);
  const [selectedTx, setSelectedTx] = useState<RecentTx | null>(null);

  const periodOptions = [
    { label: 'Hoje', value: 'today' },
  ];

  const categoryIcons: Record<string,string> = {
    Moradia: '🏠',
    Alimentação: '🍔',
    Transporte: '🚗',
    Lazer: '🎉',
    Saúde: '💊',
    Outros: '📦',
    Receita: '💸',
    Educação: '📚'
  };

  function formatMoney(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // monta start/end como ISO UTC
  function getFilterParams() {
    const params: any = {};

    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate   = end.toISOString();

    } else if (period === 'month' && selectedMonth) {
      const [y, m] = selectedMonth.split('-').map(Number);
      const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(y, m, 0).getDate();
      const end   = new Date(y, m - 1, lastDay, 23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate   = end.toISOString();

    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end   = new Date(`${endDate}T23:59:59.999`);
      params.startDate = start.toISOString();
      params.endDate   = end.toISOString();
    }

    return params;
  }

  // carrega categorias
  useEffect(() => {
    api.get('/categories')
      .then(resp => setCategories(resp.data))
      .catch(() => setCategories([]));
  }, []);

  // recarrega stats e recentes quando filtro muda
  useEffect(() => {
    if (period === 'custom' && (!startDate || !endDate)) return;

    const params = getFilterParams();
    api.get('/dashboard',       { params })
      .then(resp => setStats(resp.data))
      .catch(() => setStats(null));
    api.get('/dashboard/recent',{ params })
      .then(resp => setRecent(resp.data))
      .catch(() => setRecent([]));
  }, [period, selectedMonth, startDate, endDate, reload]);

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
      {/* logout */}
      <div className="w-full flex justify-end px-10 py-4">
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 font-semibold hover:underline"
        >
          Sair
        </button>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-10">
        {/* filtros */}
        <div className="flex flex-wrap gap-4 mb-8">
          {periodOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setPeriod(opt.value as 'today');
                setSelectedMonth('');
                setStartDate(currentDate);
                setEndDate(currentDate);
              }}
              className={`px-5 py-3 rounded-lg font-semibold transition ${
                period === opt.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 border hover:bg-blue-50'
              }`}
            >
              {opt.label}
            </button>
          ))}

          {/* mês/ano */}
          <input
            type="month"
            value={selectedMonth}
            onChange={e => {
              if (e.target.value) {
                setPeriod('month');
                setSelectedMonth(e.target.value);
              } else {
                setPeriod('today');
                setSelectedMonth(currentYearMonth);
                setStartDate(currentDate);
                setEndDate(currentDate);
              }
            }}
            className="border rounded px-3 py-2"
          />

          {/* custom */}
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setPeriod('custom');
              setStartDate(e.target.value);
            }}
            className="border rounded px-3 py-2"
          />
          <span className="px-1 self-center">até</span>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setPeriod('custom');
              setEndDate(e.target.value);
            }}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* cards de saldo */}
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

        {/* gráfico e tabela */}
        <div className="grid grid-cols-2 gap-10">
          {/* gastos por categoria */}
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
                  {stats.byCategory.map(entry => (
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
                {stats.byCategory.map(cat => {
                  const c = getCategory(cat.category);
                  return (
                    <div key={cat.category} className="flex items-center gap-2">
                      <span className="text-xl" style={{ color: c?.color }}>
                        {categoryIcons[c?.name || 'Outros']}
                      </span>
                      <span>{c?.name}</span>
                      <span className="ml-auto font-semibold">{formatMoney(cat.value)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* transações recentes */}
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
                        <td className="text-sm text-gray-500">
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={`text-right font-bold pr-6 min-w-[120px] ${
                          tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                        </td>
                        <td className="text-center pl-2 min-w-[40px]">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="text-red-500 hover:text-red-700 text-xl"
                          >
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

        {/* confirmação de exclusão */}
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

        {/* botão nova transação */}
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
