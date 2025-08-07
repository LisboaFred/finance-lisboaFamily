// src/types/index.ts
export interface Category {
  _id: string;
  name: string;
  color?: string;
}
export interface CategoryStat {
  category: string;
  value: number;
}
export interface HistoryPoint {
  month: string;
  amount: number;
}
export interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  savingsPercent: number;
  byCategory: CategoryStat[];
  history: HistoryPoint[];
}
export interface RecentTx {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status?: string;
  paymentMethod?: 'pix' | 'credito' | 'debito' | 'alelo';
}
