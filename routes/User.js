const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Middleware de autenticação (opcional, se usar JWT)
const verify = require('../verifyToken'); // Crie esse middleware se quiser proteger as rotas

// LISTAR TODOS OS USUÁRIOS (admin ou teste)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Não retorna a senha
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUSCAR UM USUÁRIO POR ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATUALIZAR UM USUÁRIO
router.put('/:id', async (req, res) => {
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETAR UM USUÁRIO
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
