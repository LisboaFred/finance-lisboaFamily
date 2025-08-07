import React from 'react';

interface Props {
  userName: string;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onLogout: () => void;
}

export function DashboardHeader({ userName, showMenu, setShowMenu, menuRef, onLogout }: Props) {
  return (
    <div className="bg-white px-10 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
        <span className="text-xl">💸</span>
        Lisboa Finances
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Olá, {userName}</span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-blue-100 text-blue-600 font-bold w-8 h-8 rounded-full"
          >
            {userName.charAt(0).toUpperCase()}
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow px-4 py-2 z-50">
              <button
                onClick={onLogout}
                className="text-sm text-red-600 font-medium hover:underline"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
