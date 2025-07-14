const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
    body('category').trim().isLength({ min: 1 }).withMessage('Categoria é obrigatória'),
    body('amount').isNumeric().withMessage('Valor deve ser numérico'),
    body('description').trim().isLength({ min: 1 }).withMessage('Descrição é obrigatória'),
    body('date').isISO8601().withMessage('Data inválida')
  ],
  transactionController.createTransaction
);

router.get('/', auth, transactionController.getTransactions);
router.put('/:id', auth, transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);

module.exports = router;
