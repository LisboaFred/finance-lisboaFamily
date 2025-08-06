import { useEffect, useState, useRef, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip,
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
  savingsPercent: number;
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
  paymentMethod?: 'pix' | 'credito' | 'debito' | 'alelo';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Usuário';

// aba principal
  const [tab, setTab] = useState<'rapido' | 'completo' | 'relatorio'>('completo');

// formatação helpers
  const pad = (n: number) => n.toString().padStart(2, '0');
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const currentDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// filtros
  const [period, setPeriod] = useState<'today' | 'month' | 'custom'>('today');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(currentDate);
  const [endDate, setEndDate] = useState<string>(currentDate);
// dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentTx[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedTx, setSelectedTx] = useState<RecentTx | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const periodOptions = [{ label: 'Hoje', value: 'today' }];
  const categoryIcons: Record<string, string> = {
    Moradia: '🏠',
    Alimentação: '🍔',
    Transporte: '🚗',
    Lazer: '🎉',
    Saúde: '💊',
    Outros: '📦',
    Salário: '💸',
    Educação: '📚',
    Vestuário: '👕',
    Pets: '🐕',
    Investimentos: '📈',
    Manutenção: '🔨',
    Supermercado: '🛒',
    Carro: '🚗',
    Academia: '🏋️‍♂️',
    Presente: '🎁',
    Assinaturas: '🎥',

  };

  function formatMoney(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function getFilterParams() {
    const params: any = {};
    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'month' && selectedMonth) {
      const [y, m] = selectedMonth.split('-').map(Number);
      const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(y, m, 0).getDate();
      const end = new Date(y, m - 1, lastDay, 23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59.999`);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }
    return params;
  }

  useEffect(() => {
    api.get('/categories')
      .then(resp => setCategories(resp.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (period === 'custom' && (!startDate || !endDate)) return;
    const params = getFilterParams();
    api.get('/dashboard', { params })
      .then(resp => setStats(resp.data))
      .catch(() => setStats(null));
    api.get('/dashboard/recent', { params })
      .then(resp => setRecent(resp.data))
      .catch(() => setRecent([]));
  }, [period, selectedMonth, startDate, endDate, reload]);

  function getCategory(id: string) {
    return categories.find(cat => cat._id === id);
  }
  function getPaymentMethod(id: string) {
    return categories.find(cat => cat._id === id);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState({ categoria: '', data: '', valor: '', pagamento: '' });

  const sorted = useMemo(() => {
    let data = [...recent];

    // Filtros
      if (filter.categoria) {
        data = data.filter((tx) => {
          const c = getCategory(tx.category);
          return (c?.name || tx.category).toLowerCase().includes(filter.categoria.toLowerCase());
        });
      }

      if (filter.data) {
        data = data.filter((tx) => new Date(tx.date).toLocaleDateString('pt-BR').includes(filter.data));
      }
      if (filter.valor) {
        // Opcional: pode deixar para busca por valor textual/número
        const valorFiltro = filter.valor.replace(/[^\d]/g, "");
        data = data.filter((tx) => {
          const valorData = Math.abs(Number(tx.amount)).toString();
          return valorData.includes(valorFiltro);
        });
      }

      if (filter.pagamento) {
        data = data.filter((tx) => {
          const label =
            tx.paymentMethod === 'pix'
              ? 'pix'
              : tx.paymentMethod === 'credito'
              ? 'crédito'
              : tx.paymentMethod === 'debito'
              ? 'débito'
              : tx.paymentMethod || '';
          return label.toLowerCase().includes(filter.pagamento.toLowerCase());
        });
      }

      // Ordenação
      if (sortField) {
        data.sort((a, b) => {
          if (sortField === "categoria") {
            const aField = (getCategory(a.category)?.name ?? a.category ?? "").toString();
            const bField = (getCategory(b.category)?.name ?? b.category ?? "").toString();
            if (aField < bField) return sortDir === "asc" ? -1 : 1;
            if (aField > bField) return sortDir === "asc" ? 1 : -1;
            return 0;
          }
          if (sortField === "data") {
            const aField = new Date(a.date).getTime() || 0;
            const bField = new Date(b.date).getTime() || 0;
            if (aField < bField) return sortDir === "asc" ? -1 : 1;
            if (aField > bField) return sortDir === "asc" ? 1 : -1;
            return 0;
          }
          if (sortField === "valor") {
            const aField = a.amount ?? 0;
            const bField = b.amount ?? 0;
            if (aField < bField) return sortDir === "asc" ? -1 : 1;
            if (aField > bField) return sortDir === "asc" ? 1 : -1;
            return 0;
          }
          if (sortField === "pagamento") {
            const aField = (a.paymentMethod ?? '').toString();
            const bField = (b.paymentMethod ?? '').toString();
            if (aField < bField) return sortDir === "asc" ? -1 : 1;
            if (aField > bField) return sortDir === "asc" ? 1 : -1;
            return 0;
          }
          return 0;
        });
      }
    return data;
  }, [recent, sortField, sortDir, filter, getCategory, formatMoney]);

  const handleSort = (field: "categoria" | "data" | "valor" | "pagamento") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };



  return (
    <div className="min-h-screen bg-gray-300">
      <div className="bg-white px-10 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <span className="text-xl">💸</span>
          Lisboa Finances
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Olá, {userName}</span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full"
            >
              {userName.charAt(0).toUpperCase()}
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow px-4 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-10 flex gap-4">
        <button
          onClick={() => setTab('rapido')}
          className={`px-5 py-2 rounded ${tab === 'rapido' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
        >
          Dados Rápidos
        </button>
        <button
          onClick={() => setTab('completo')}
          className={`px-5 py-2 rounded ${tab === 'completo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
        >
          Dados Completos
        </button>
        <button
          onClick={() => setTab('relatorio')}
          className={`px-5 py-2 rounded ${tab === 'relatorio' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
        >
          Relatórios
        </button>
      </div>

      <div className="max-w-7xl mx-auto py-1 px-10">
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
                <div className="text-2xl font-bold text-orange-500">
                  {stats.savingsPercent?.toFixed(1)}%
                </div>
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
                <Tooltip
                  formatter={(value, name, props) => {
                    // Recupera nome da categoria pelo id
                    const categoryName = getCategory(props.payload.category)?.name || props.payload.category;
                    return [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, categoryName];
                  }}
                />
              </PieChart>
            )}
            {stats && (
              <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-6 w-full">
                {stats.byCategory.map(cat => {
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
            )}
          </div>

          {/* transações recentes */}
          <div className="bg-white rounded-2xl shadow p-10 min-h-[350px] flex flex-col">
            <h3 className="text-lg font-bold text-center mb-6">Transações Recentes</h3>
            {/* Tabela rolável com cabeçalho fixo */}
            <div className="overflow-y-auto" style={{ maxHeight: 800 }}>
              <table className="w-full text-base" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="text-gray-400 font-semibold select-none">
                    <th
                      className="text-left pl-2 cursor-pointer"
                      style={{ width: '32%', whiteSpace: 'nowrap' }}
                      onClick={() => handleSort("categoria")}
                    >
                      Categoria{sortField === "categoria" && (sortDir === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th
                      className="text-center cursor-pointer"
                      style={{ width: '20%', whiteSpace: 'nowrap' }}
                      onClick={() => handleSort("data")}
                    >
                      Data{sortField === "data" && (sortDir === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th
                      className="text-center cursor-pointer"
                      style={{ width: '32%', whiteSpace: 'nowrap' }}
                      onClick={() => handleSort("valor")}
                    >
                      Valor{sortField === "valor" && (sortDir === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th
                      className="text-center cursor-pointer"
                      style={{ width: '24%', whiteSpace: 'nowrap' }}
                      onClick={() => handleSort("pagamento")}
                    >
                      Pagamento{sortField === "pagamento" && (sortDir === "asc" ? " ▲" : " ▼")}
                    </th>
                    <th className="text-right" style={{ width: '14%' }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((tx) => {
                    const c = getCategory(tx.category);
                    return (
                      <tr key={tx._id} className="border-b last:border-b-0 hover:bg-gray-50">
                        {/* Categoria */}
                        <td
                          className="text-left pl-2 font-semibold truncate"
                          style={{
                            width: '28%',
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <span className="text-lg">{categoryIcons[c?.name || "Outros"]}</span>
                          <span>{c?.name || tx.category}</span>
                        </td>
                        {/* Data */}
                        <td className="text-sm text-gray-500 text-center" style={{ width: '16%' }}>
                          {new Date(tx.date).toLocaleDateString("pt-BR")}
                        </td>
                        {/* Valor */}
                        <td
                          className={`text-right font-bold pr-6 ${tx.amount >= 0 ? "text-green-600" : "text-red-500"}`}
                          style={{
                            width: '26%',
                            maxWidth: 160,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {tx.amount >= 0 ? "+" : "-"}{formatMoney(Math.abs(tx.amount))}
                        </td>
                        {/* Pagamento */}
                        <td className="text-center font-medium" style={{ width: '16%' }}>
                          {tx.paymentMethod === 'pix'
                            ? 'Pix'
                            : tx.paymentMethod === 'credito'
                            ? 'Crédito'
                            : tx.paymentMethod === 'debito'
                            ? 'Débito'
                            : tx.paymentMethod === 'alelo'
                            ? 'Alelo'
                            : ''}
                        </td>
                        {/* Excluir */}
                        <td className="text-right" style={{ width: '14%' }}>
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
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-400">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
