import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';

const router = Router();

router.post(
  '/',
  auth,
  [
    body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
    body('category').trim().notEmpty().withMessage('Categoria é obrigatória'),
    body('amount').isNumeric().withMessage('Valor deve ser numérico'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
    body('date').isISO8601().withMessage('Data inválida'),
  ],
  createTransaction
);

router.get('/', auth, getTransactions);
router.put('/:id', auth, updateTransaction);
router.delete('/:id', auth, deleteTransaction);

export default router;
