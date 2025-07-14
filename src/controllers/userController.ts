import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
