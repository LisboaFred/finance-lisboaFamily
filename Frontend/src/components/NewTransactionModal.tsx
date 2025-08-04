import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

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
  const [categories, setCategories] = useState<{ _id: string; name: string; color?: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credito' | 'debito' | 'alelo'>('pix');


  // Carrega as categorias
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Envio do formulário
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Converte "YYYY-MM-DD" em Date local meia-noite
    const [y, m, d] = date.split('-').map(Number);
    const localDateISO = new Date(y, m - 1, d).toISOString();

    const payload: any = {
      type,
      category,
      amount: Number(value),
      date: localDateISO,
      paymentMethod,
    };
    if (desc.trim() !== '') {
      payload.description = desc.trim();
    }

    try {
      await api.post('/transactions', payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar transação:', err.response?.data || err.message);
      alert('Erro ao salvar transação. Verifique os campos.');
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
        <div className="flex gap-2 mb-4">
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
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Valor</label>
          <input
            type="number"
            required
            placeholder="Valor"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition text-lg"
          />
        </div>
          {/* Forma de Pagamento */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Forma de Pagamento</label>
            <select
              required
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as 'pix' | 'credito' | 'debito' | 'alelo')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="pix">Pix</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="alelo">Alelo</option>
            </select>
          </div>

        {/* Data */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Data</label>
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
        <div className="flex gap-4 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow transition"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );

}
