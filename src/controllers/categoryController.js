const Category = require('../../models/Category');

// Criar categoria
exports.createCategory = async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      user: req.user
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Obter categorias do usuário
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
