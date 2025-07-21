import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import api from '../../services/api';
import NewTransactionModal from '../NewTransactionModal';

interface Category {
  _id: string;
  name: string;
  color?: string;
}
interface CategoryStat {
  category: string;
  value: number;
}
interface HistoryPoint {
  month: string;
  amount: number;
}
interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  byCategory: CategoryStat[];
  history: HistoryPoint[];
}
interface RecentTx {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status?: string;
}
