import React from 'react';
import { RecentTx, Category } from '../../types/index';
import { formatMoney } from '../../utils/format';
import { categoryIcons } from '../../utils/categoryIcons';

interface Props {
  transactions: RecentTx[];
  getCategory: (id: string) => Category | undefined;
  onDelete: (tx: RecentTx) => void;
  handleSort: (field: "categoria" | "data" | "valor" | "pagamento") => void;
  sortField: string;
  sortDir: string;
  onSelect?: (tx: RecentTx) => void;
}

export function RecentTransactionsTable({
  transactions, getCategory, onDelete, handleSort, sortField, sortDir, onSelect
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-10 min-h-[350px] flex flex-col">
      <h3 className="text-lg font-bold text-center mb-6">Transações</h3>
      <div className="overflow-y-auto" style={{ maxHeight: 800 }}>
        <table className="w-full text-base" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="text-gray-400 font-semibold select-none">
              <th className="text-left pl-2 cursor-pointer"
                  style={{ width: '36%', whiteSpace: 'nowrap' }}
                  onClick={() => handleSort("categoria")}
              >
                Categoria{sortField === "categoria" && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="text-center cursor-pointer"
                  style={{ width: '20%', whiteSpace: 'nowrap' }}
                  onClick={() => handleSort("data")}
              >
                Data{sortField === "data" && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="text-center cursor-pointer"
                  style={{ width: '32%', whiteSpace: 'nowrap' }}
                  onClick={() => handleSort("valor")}
              >
                Valor{sortField === "valor" && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="text-center cursor-pointer"
                  style={{ width: '24%', whiteSpace: 'nowrap' }}
                  onClick={() => handleSort("pagamento")}
              >
                Pagamento{sortField === "pagamento" && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
              <th className="text-center" style={{ width: '14%' }}>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const c = getCategory(tx.category);
              return (
                <tr key={tx._id} className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect && onSelect(tx)}>
                  {/* Categoria */}
                  <td className="text-left pl-2 font-semibold truncate"
                      style={{ width: '28%', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span className="text-lg">{categoryIcons[c?.name || "Outros"]}</span>
                    <span>{c?.name || tx.category}</span>
                  </td>
                  {/* Data */}
                  <td className="text-sm text-gray-500 text-center" style={{ width: '16%' }}>
                    {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </td>
                  {/* Valor */}
                  <td className={`text-right font-bold pr-6 ${tx.amount >= 0 ? "text-green-600" : "text-red-500"}`}
                      style={{ width: '26%', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      onClick={() => onDelete(tx)}
                      className="text-red-500 hover:text-red-700 text-xl"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
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
  );
}
