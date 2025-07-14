const Transaction = require('../../models/Transaction');

exports.getDashboard = async (req, res) => {
  try {
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Receitas e despesas do mês
    const monthlyIncome = await Transaction.aggregate([
      {
        $match: {
          user: req.user,
          type: 'income',
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user,
          type: 'expense',
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Gastos por categoria
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          user: req.user,
          type: 'expense',
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Transações recentes
    const recentTransactions = await Transaction.find({
      user: req.user
    })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      monthlyIncome: monthlyIncome[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      balance: (monthlyIncome[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
      expensesByCategory,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
