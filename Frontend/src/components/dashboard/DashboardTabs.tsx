import React from 'react';

interface Props {
  tab: string;
  setTab: (tab: 'rapido' | 'completo' | 'relatorio') => void;
}

export function DashboardTabs({ tab, setTab }: Props) {
  return (
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
  );
}
