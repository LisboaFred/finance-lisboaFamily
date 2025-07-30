import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export const register = async (req: Request, res: Response) => {
  return res.status(403).json({ message: 'Cadastro de usuários está desabilitado.' });
};

/*export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET ?? 'secretkey', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; */

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: 'Credenciais inválidas' });
      return;
    }
    const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET ?? 'Fred1201', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user;
  try {
    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
