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
import { pad } from '../../utils/format';
import { Category, DashboardStats, RecentTx } from '../../types';
import { TransactionDetailsCard } from '../dashboard/TransactionDetailsCard';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Usuário';

  const [tab, setTab] = useState<'rapido' | 'completo' | 'relatorio'>('rapido');
  const today = new Date();
  const currentDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentTx[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [selectedTx, setSelectedTx] = useState<RecentTx | null>(null);
  const [selectedTxDetails, setSelectedTxDetails] = useState<RecentTx | null>(null);

  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState<'today' | 'month' | 'all' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(currentDate);
  const [endDate, setEndDate] = useState<string>(currentDate);

  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState({ categoria: '', data: '', valor: '', pagamento: '' });

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const periodOptions = [
    { label: 'Hoje', value: 'today' },
    { label: 'Este mês', value: 'month' },
    { label: 'Sempre', value: 'all' }
  ];

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
      const y = today.getFullYear();
      const m = today.getMonth();
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const lastDay = new Date(y, m + 1, 0).getDate();
      const end = new Date(y, m, lastDay, 23, 59, 59, 999);
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

  function getCategory(id: string) {
    return categories.find(cat => cat._id === id);
  }

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
        let aField: any;
        let bField: any;
        if (sortField === "categoria") {
          aField = (getCategory(a.category)?.name ?? a.category ?? "").toString();
          bField = (getCategory(b.category)?.name ?? b.category ?? "").toString();
        }
        if (sortField === "data") {
          aField = new Date(a.date).getTime() || 0;
          bField = new Date(b.date).getTime() || 0;
        }
        if (sortField === "valor") {
          aField = a.amount ?? 0;
          bField = b.amount ?? 0;
        }
        if (sortField === "pagamento") {
          aField = (a.paymentMethod ?? '').toString();
          bField = (b.paymentMethod ?? '').toString();
        }
        if (aField < bField) return sortDir === "asc" ? -1 : 1;
        if (aField > bField) return sortDir === "asc" ? 1 : -1;
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

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Sessão encerrada.');
    navigate('/login');
  }

  function handleDelete(id: string) {
    api.delete(`/transactions/${id}`)
      .then(() => {
        toast.success('Transação excluída com sucesso!');
        setReload(r => r + 1);
        setSelectedTx(null);
      })
      .catch(() => toast.error('Erro ao excluir transação.'));
  }

  useEffect(() => {
    api.get('/categories')
      .then(resp => setCategories(resp.data))
      .catch(() => toast.error('Erro ao carregar categorias.'));
  }, []);

  useEffect(() => {
    if (period === 'custom' && (!startDate || !endDate)) return;
    setLoading(true);
    const params = getFilterParams();
    Promise.all([
      api.get('/dashboard', { params }),
      api.get('/dashboard/recent', { params })
    ])
      .then(([statsResp, recentResp]) => {
        setStats(statsResp.data);
        setRecent(recentResp.data);
      })
      .catch(() => {
        toast.error('Erro ao carregar dados da dashboard.');
        setStats(null);
        setRecent([]);
      })
      .finally(() => setLoading(false));
  }, [period, startDate, endDate, reload]);

  const pieData = stats
    ? stats.byCategory.map(cat => ({
        ...cat,
        value: Math.abs(cat.value)
      }))
    : [];

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

          {loading && <div className="text-center text-gray-500 py-6">Carregando...</div>}
          {!loading && stats && <DashboardCards stats={stats} />}

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

          {selectedTx && (
            <ConfirmDeleteModal
              onConfirm={() => handleDelete(selectedTx._id)}
              onCancel={() => setSelectedTx(null)}
            />
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

          <div className="grid grid-cols-2 gap-10">
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

          {selectedTx && (
            <ConfirmDeleteModal
              onConfirm={() => handleDelete(selectedTx._id)}
              onCancel={() => setSelectedTx(null)}
            />
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
      )}

      {tab === 'relatorio' && (
        <div className="max-w-7xl mx-auto py-10 px-10 text-center text-xl text-gray-500">
          Em desenvolvimento...
        </div>
      )}
    </div>
  );
}
