import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction, { ITransaction } from '../models/Transaction';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // transforma a string do req.user em ObjectId do Mongo
    const userId = new mongoose.Types.ObjectId((req as any).user as string);

    const summary = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    res.status(200).json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
