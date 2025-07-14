const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotas
const userRoutes = require('./routes/User');
app.use('/api/users', userRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const transactionRoutes = require('./routes/Transaction');
app.use('/api/transactions', transactionRoutes);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_bot')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});