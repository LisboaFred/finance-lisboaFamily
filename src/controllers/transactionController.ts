import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Transaction, { ITransaction } from '../models/Transaction';

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const tx = new Transaction({ ...(req.body as Omit<ITransaction, 'user'>), user: (req as any).user });
    const saved = await tx.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', type, category, startDate, endDate } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const query: any = { user: (req as any).user };
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate)   query.date.$lte = new Date(endDate as string);
    }
    const list = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: (req as any).user },
      req.body,
      { new: true }
    );
    if (!tx) {
      res.status(404).json({ message: 'Transação não encontrada' });
      return;
    }
    res.json(tx);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: (req as any).user });
    if (!tx) {
      res.status(404).json({ message: 'Transação não encontrada' });
      return;
    }
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
