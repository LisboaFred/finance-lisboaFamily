import React from 'react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md text-center">
        <h2 className="text-lg font-bold mb-4">Confirmar</h2>
        <p className="mb-6">Deseja realmente excluir essa transação?</p>
        <div className="flex justify-around gap-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Excluir
          </button>
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
