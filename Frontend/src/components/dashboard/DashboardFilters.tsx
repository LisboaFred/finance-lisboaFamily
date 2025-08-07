import React from 'react';

interface Props {
  period: string;
  setPeriod: (period: 'today' | 'month' | 'all' | 'custom') => void;
  periodOptions: { label: string; value: string }[];
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  currentDate: string;
}

export function DashboardFilters({
  period, setPeriod, periodOptions, startDate, setStartDate, endDate, setEndDate, currentDate
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {periodOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => {
            setPeriod(opt.value as 'today' | 'month' | 'all');
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
      {/* Botão para ativar custom */}
      <button
        onClick={() => setPeriod('custom')}
        className={`px-5 py-3 rounded-lg font-semibold transition ${
          period === 'custom'
            ? 'bg-blue-600 text-white shadow'
            : 'bg-white text-gray-700 border hover:bg-blue-50'
        }`}
      >
        Personalizado
      </button>
      {/* custom */}
      {period === 'custom' && (
        <>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <span className="px-1 self-center">até</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </>
      )}
    </div>
  );
}
