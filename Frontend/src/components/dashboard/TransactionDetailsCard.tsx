// src/components/dashboard/TransactionDetailsCard.tsx
import { Category, RecentTx } from '../../types';
import { formatMoney } from '../../utils/format';
import { categoryIcons } from '../../utils/categoryIcons';

// Estendendo a interface localmente caso o types.ts não tenha sido atualizado ainda
// Se você atualizar o types.ts globalmente, pode remover esse extends.
interface ExtendedTx extends RecentTx {
  installmentCount?: number;
  installmentTotal?: number;
}

interface Props {
  tx: ExtendedTx; 
  getCategory: (id: string) => Category | undefined;
}

export function TransactionDetailsCard({ tx, getCategory }: Props) {
  const categoria = getCategory(tx.category);

  // Formata o texto do pagamento. Ex: "Crédito (2/10)" ou apenas "Pix"
  const getPaymentLabel = () => {
    const method = tx.paymentMethod || '-';
    // Se tiver dados de parcela e for maior que 1
    if (tx.installmentTotal && tx.installmentTotal > 1) {
      return `${method} (${tx.installmentCount}/${tx.installmentTotal})`;
    }
    return method;
  };

  return (
    <div className="bg-gradient-to-br from-[#181f2c] to-[#232b41] rounded-2xl shadow-xl p-8 min-h-[350px] flex flex-col gap-6 border border-[#232a45]">
      <div className="flex items-center gap-4 mb-2">
        <div className="bg-blue-600/20 text-blue-400 rounded-full p-3 text-2xl shadow-md flex items-center justify-center">
          {categoryIcons[categoria?.name || "Outros"]}
        </div>
        <h2 className="font-bold text-xl text-white tracking-wide">Detalhes da Transação</h2>
      </div>
      <div className="flex flex-col gap-3 text-white text-base">
        <div>
          <span className="font-semibold text-blue-400">Categoria:</span>
          <span className="ml-2">{categoria?.name}</span>
        </div>
        <div>
          <span className="font-semibold text-blue-400">Descrição:</span>
          <span className="ml-2 text-gray-200">{tx.description}</span>
        </div>
        <div>
          <span className="font-semibold text-blue-400">Valor:</span>
          <span className={`ml-2 ${tx.amount < 0 ? "text-red-400" : "text-green-400"} font-bold`}>
            {formatMoney(tx.amount)}
          </span>
        </div>
        <div>
          <span className="font-semibold text-blue-400">Data:</span>
          <span className="ml-2 text-gray-200">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
        </div>
        <div>
          <span className="font-semibold text-blue-400">Pagamento:</span>
          <span className="ml-2 text-gray-200 font-medium capitalize">
            {getPaymentLabel()}
          </span>
        </div>
      </div>
    </div>
  );
}