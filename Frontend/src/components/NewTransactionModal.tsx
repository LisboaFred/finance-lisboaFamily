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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded ${
              type === 'expense'
                ? 'bg-red-100 border border-red-500'
                : 'bg-gray-100'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded ${
              type === 'income'
                ? 'bg-green-100 border border-green-500'
                : 'bg-gray-100'
            }`}
          >
            Receita
          </button>
        </div>

        <select
          required
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full rounded-md border-gray-300"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="number"
          required
          placeholder="Valor"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full rounded-md border-gray-300 px-3 py-2"
        />

        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-md border-gray-300 px-3 py-2"
        />

        <input
          type="text"
          placeholder="Descrição (opcional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full rounded-md border-gray-300 px-3 py-2"
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-500 text-white"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
}
