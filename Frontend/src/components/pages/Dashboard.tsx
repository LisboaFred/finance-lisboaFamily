// src/pages/Dashboard.tsx

import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import NewTransactionModal from '../NewTransactionModal';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { DashboardTabs } from '../dashboard/DashboardTabs';
import { DashboardFilters } from '../dashboard/DashboardFilters';
import { DashboardCards } from '../dashboard/DashboardCards';
import { CategoryPieChart } from '../dashboard/CategoryPieChart';
import { RecentTransactionsTable } from '../dashboard/RecentTransactionsTable';
import { ConfirmDeleteModal } from '../dashboard/ConfirmDeleteModal';
import { formatMoney, pad } from '../../utils/format';
import { Category, DashboardStats, RecentTx } from '../../types';
import { TransactionDetailsCard } from '../dashboard/TransactionDetailsCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Usuário';

  // Estados principais
  const [tab, setTab] = useState<'rapido' | 'completo' | 'relatorio'>('rapido');
  const today = new Date();
  const currentDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const [selectedTxDetails, setSelectedTxDetails] = useState<RecentTx | null>(null);


  // Filtros
  const [period, setPeriod] = useState<'today' | 'month' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(currentDate);
  const [endDate, setEndDate] = useState<string>(currentDate);

  // Dados
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentTx[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedTx, setSelectedTx] = useState<RecentTx | null>(null);

  // Menu Header
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Opções de período
  const periodOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Este mês', value: 'month' },
    { label: 'Sempre', value: 'all' }
  ];

  // Helpers
  function getFilterParams() {
    const params: any = {};
    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'month') {
      // mês atual
      const y = today.getFullYear();
      const m = today.getMonth();
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const lastDay = new Date(y, m + 1, 0).getDate();
      const end = new Date(y, m, lastDay, 23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    } else if (period === 'all') {
      // Sem data, busca tudo
    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59.999`);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }
    return params;
  }

  function getCategory(id: string) {
    return categories.find(cat => cat._id === id);
  }

  // Sort, filter e search das transações
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState({ categoria: '', data: '', valor: '', pagamento: '' });

  // Filtragem e ordenação
  const sorted = (() => {
    let data = [...recent];

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
  })();

  const handleSort = (field: "categoria" | "data" | "valor" | "pagamento") => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Pie chart data
  const pieData = stats
    ? stats.byCategory.map(cat => ({
        ...cat,
        value: Math.abs(cat.value)
      }))
    : [];

  // Effects
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  }, [period, startDate, endDate, reload]);

  // Funções de ações
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

  // Render
  return (
    <div className="min-h-screen bg-gray-300">
      <DashboardHeader
        userName={userName}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        menuRef={menuRef}
        onLogout={handleLogout}
      />

      <DashboardTabs tab={tab} setTab={setTab} />

      {tab === 'rapido' && (
        <div className="max-w-7xl mx-auto py-1 px-10">
          <DashboardFilters
            period={period}
            setPeriod={setPeriod}
            periodOptions={periodOptions}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            currentDate={currentDate}
          />

          {stats && <DashboardCards stats={stats} />}

          {/* gráfico e tabela */}
          <div className="grid grid-cols-2 gap-10">
            <CategoryPieChart
              pieData={pieData}
              getCategory={getCategory}
            />

            <RecentTransactionsTable
              transactions={sorted}
              getCategory={getCategory}
              onDelete={(tx) => setSelectedTx(tx)}
              handleSort={handleSort}
              sortField={sortField}
              sortDir={sortDir}
            />
          </div>

          {/* confirmação de exclusão */}
          {selectedTx && (
            <ConfirmDeleteModal
              onConfirm={() => handleDelete(selectedTx._id)}
              onCancel={() => setSelectedTx(null)}
            />
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
      )}

      {tab === 'completo' && (
        <div className="max-w-7xl mx-auto py-1 px-10">
          <DashboardFilters
            period={period}
            setPeriod={setPeriod}
            periodOptions={periodOptions}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            currentDate={currentDate}
          />

          {/* Cards opcionais, se quiser mostrar algo antes da grid */}

          {/* Tabela e detalhes */}
          <div className="grid grid-cols-2 gap-10">
            {/* Tabela à esquerda */}
            <div>
              <RecentTransactionsTable
                transactions={sorted}
                getCategory={getCategory}
                onDelete={(tx) => setSelectedTx(tx)}
                handleSort={handleSort}
                sortField={sortField}
                sortDir={sortDir}
                onSelect={setSelectedTxDetails}
              />
            </div>
            {/* Detalhes à direita */}
            <div>
              {selectedTxDetails ? (
                <TransactionDetailsCard tx={selectedTxDetails} getCategory={getCategory} />
              ) : (
                <div className="bg-white rounded-2xl shadow p-10 min-h-[350px] flex items-center justify-center text-gray-400">
                  Selecione uma transação para ver os detalhes.
                </div>
              )}
            </div>
          </div>

          {/* confirmação de exclusão */}
          {selectedTx && (
            <ConfirmDeleteModal
              onConfirm={() => handleDelete(selectedTx._id)}
              onCancel={() => setSelectedTx(null)}
            />
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
      )}


      {tab === 'relatorio' && (
        <div className="max-w-7xl mx-auto py-10 px-10 text-center text-xl text-gray-500">
          Em desenvolvimento...
        </div>
      )}
    </div>
  );
}
