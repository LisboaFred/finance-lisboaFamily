import { Request, Response } from 'express';
import Transaction, { ITransaction } from '../models/Transaction';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user;
    const summary = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);
    res.status(200).json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
