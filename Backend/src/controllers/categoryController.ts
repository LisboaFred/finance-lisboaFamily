import { Request, Response } from 'express';
import Category, { ICategory } from '../models/Category';

export const getCategories = async (_: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, color } = req.body;
    if (await Category.findOne({ name })) {
      res.status(400).json({ message: 'Categoria já existe' });
      return;
    }
    const cat = new Category({ name, color });
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Categoria não encontrada' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Categoria deletada' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
