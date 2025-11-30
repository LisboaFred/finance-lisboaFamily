import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

type PaymentMethod = 'pix' | 'credito' | 'debito' | 'alelo';

export default function NewTransactionModal({ onClose, onSuccess }: Props) {
  // Helpers para data de hoje
  const pad = (n: number) => n.toString().padStart(2, '0');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Estados do formulário
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState<string>(todayStr);
  const [desc, setDesc] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  // NOVO ESTADO: Número de parcelas (padrão 1)
  const [installments, setInstallments] = useState<number>(1);

  // Dados auxiliares
  const [categories, setCategories] = useState<{ _id: string; name: string; color?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);

  // Carrega as categorias
  useEffect(() => {
    setLoadingCats(true);
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => {
        const msg = err?.response?.data?.message || 'Erro ao carregar categorias.';
        toast.error(msg);
        setCategories([]);
      })
      .finally(() => setLoadingCats(false));
  }, []);

  // Envio do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validações simples
    if (!category) {
      toast.error('Selecione uma categoria.');
      return;
    }
    if (!value || Number.isNaN(Number(value))) {
      toast.error('Informe um valor válido.');
      return;
    }
    if (!date) {
      toast.error('Informe a data.');
      return;
    }

    const numericValue = Number(value);
    const finalDesc = desc.trim();

    // Data base para cálculo (meia-noite local para evitar timezone issues básicos)
    const [y, m, d] = date.split('-').map(Number);
    // Nota: Mês no Date construtor é index 0 (Jan = 0)
    const baseDateObj = new Date(y, m - 1, d);

    setLoading(true);
    try {
      
      // LÓGICA DE PARCELAMENTO (Se for Crédito E parcelas > 1)
      if (paymentMethod === 'credito' && installments > 1) {
        
        // Valor de cada parcela
        // Nota: toFixed(2) ajuda a evitar dízimas, mas pode gerar diferença de centavos no total.
        // Para uso pessoal simples, isso costuma ser aceitável.
        const installmentValue = Number((numericValue / installments).toFixed(2));
        
        const promises = [];

        for (let i = 0; i < installments; i++) {
          // Clona a data base e adiciona 'i' meses
          const txDate = new Date(baseDateObj);
          txDate.setMonth(baseDateObj.getMonth() + i);

          const payload = {
            type,
            category,
            amount: installmentValue,
            date: txDate.toISOString(),
            paymentMethod,
            description: finalDesc ? `${finalDesc} (${i + 1}/${installments})` : `Parcela (${i + 1}/${installments})`,
            // Enviamos metadados extras se o backend suportar (conforme alteração no Transaction.ts)
            installmentCount: i + 1,
            installmentTotal: installments
          };

          promises.push(api.post('/transactions', payload));
        }

        // Aguarda todas as requisições
        await Promise.all(promises);

      } else {
        // LÓGICA PADRÃO (Sem parcelamento)
        const payload: any = {
          type,
          category,
          amount: numericValue,
          date: baseDateObj.toISOString(),
          paymentMethod,
        };
        if (finalDesc !== '') {
          payload.description = finalDesc;
        }

        await api.post('/transactions', payload);
      }

      toast.success('Transação registrada com sucesso!');
      onSuccess && onSuccess();
      onClose(); 
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message;
      const fallback =
        type === 'expense'
          ? 'Não foi possível registrar a despesa.'
          : 'Não foi possível registrar a receita.';
      toast.error(apiMsg || fallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative space-y-6"
      >
        {/* Botão X de fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-7 top-7 text-gray-300 hover:text-red-400 text-3xl font-bold"
          title="Fechar"
        >
          &times;
        </button>

        {/* Tipo de transação */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition border-2
              ${type === 'expense'
                ? 'bg-red-50 text-red-600 border-red-500 shadow'
                : 'bg-gray-50 text-gray-400 border-transparent hover:bg-red-50'
              }`}
          >
            <span>🔻</span> Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition border-2
              ${type === 'income'
                ? 'bg-green-50 text-green-600 border-green-500 shadow'
                : 'bg-gray-50 text-gray-400 border-transparent hover:bg-green-50'
              }`}
          >
            <span>⬆️</span> Receita
          </button>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Categoria</label>
          <select
            required
            disabled={loadingCats}
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60"
          >
            <option value="">{loadingCats ? 'Carregando...' : 'Selecione uma categoria'}</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Valor Total</label>
          <input
            type="number"
            required
            placeholder="Valor total da compra"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition text-lg"
          />
          <p className="text-xs text-gray-400 mt-1">
            {installments > 1 
              ? `Será dividido em ${installments}x de R$ ${(Number(value)/installments).toFixed(2)}` 
              : "Use número positivo."}
          </p>
        </div>

        {/* Forma de Pagamento e Parcelas */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Pagamento / Parcelas</label>
          <div className="flex gap-2">
            <select
              required
              value={paymentMethod}
              onChange={e => {
                const method = e.target.value as PaymentMethod;
                setPaymentMethod(method);
                // Se mudar para algo que não é crédito, reseta as parcelas
                if (method !== 'credito') setInstallments(1);
              }}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="pix">Pix</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="alelo">Alelo</option>
            </select>

            {/* Dropdown de parcelas aparece apenas se for Crédito */}
            {paymentMethod === 'credito' && (
              <select
                value={installments}
                onChange={e => setInstallments(Number(e.target.value))}
                className="w-28 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition text-center font-semibold"
                title="Número de parcelas"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Data */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Data {installments > 1 ? '(1ª Parcela)' : ''}</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition text-lg"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Descrição (opcional)</label>
          <input
            type="text"
            placeholder="Descrição"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-4 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow transition disabled:opacity-60"
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </div>
  );
}