const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Criar categoria
router.post('/', auth, async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      userId: req.userId
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter categorias do usuário
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;