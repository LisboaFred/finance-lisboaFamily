import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // ID do usuário autenticado
    const userId = new mongoose.Types.ObjectId((req as any).user.id || (req as any).user.user);

    // Filtros do período
    const { startDate, endDate } = req.query;

    const filter: any = { user: userId };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    // Busca transações do período filtrado!
    const allTransactions = await Transaction.find(filter);

    // Totais do período
    const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Saldo e economia: receitas - despesas do período
    const balance = totalIncome - totalExpense;
    const savings = balance; // Economia = receitas - despesas

    // Gastos por categoria (do período)
    const byCategoryAgg = await Transaction.aggregate([
      { $match: { ...filter, type: 'expense' } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } }
    ]);
    const byCategory = byCategoryAgg.map(item => ({
      category: item._id,
      value: item.value,
    }));

    // Histórico dos últimos 6 meses (ajustado para considerar o período também, mas pode customizar se quiser)
    // Se quiser só o histórico do período filtrado, pode ajustar abaixo.
    const history: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const hMonth = d.getMonth();
      const hYear = d.getFullYear();
      const income = allTransactions
        .filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === hMonth && td.getFullYear() === hYear && t.type === 'income';
        })
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = allTransactions
        .filter(t => {
          const td = new Date(t.date);
          return td.getMonth() === hMonth && td.getFullYear() === hYear && t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      history.push({
        month: `${('0' + (hMonth + 1)).slice(-2)}/${hYear}`,
        amount: income - expense,
      });
    }

    res.status(200).json({
      balance,
      totalIncome,
      totalExpense,
      savings,
      byCategory,
      history
    });
  } catch (err: any) {
    console.error('Erro no getDashboard:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getRecentTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user.id || (req as any).user.user;
  const { startDate, endDate } = req.query;
  const filter: any = { user: userId };
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
  }
  const txs = await Transaction.find(filter).sort({ date: -1 }).limit(5);
  res.json(txs);
};
