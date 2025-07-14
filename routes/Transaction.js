const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Criar transação
router.post('/', auth, [
  body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
  body('category').trim().isLength({ min: 1 }).withMessage('Categoria é obrigatória'),
  body('amount').isNumeric().withMessage('Valor deve ser numérico'),
  body('description').trim().isLength({ min: 1 }).withMessage('Descrição é obrigatória'),
  body('date').isISO8601().withMessage('Data inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = new Transaction({
      ...req.body,
      user: req.userId 
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('ERRO POST /api/transactions', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter todas as transações do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;

    const query = { user: req.userId }; 

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(transactions); 

  } catch (error) {
    console.error('ERRO GET /api/transactions', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar transação
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, 
      req.body,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('ERRO PUT /api/transactions/:id', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar transação
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('ERRO DELETE /api/transactions/:id', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
